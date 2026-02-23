'use client';

/**
 * Kundli Report Detail Page
 * Web-standard layout with breadcrumbs, underline tabs, and PageContainer
 * Maps API response matching the mobile app's KundliReportScreen
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Gem,
  AlertTriangle,
  Grid3X3,
  Clock,
  RefreshCw,
  Loader2,
  Heart,
  Briefcase,
  Activity,
  Wallet,
  Users,
  GraduationCap,
} from 'lucide-react';
import { Card, Skeleton, Button } from '@/components/ui';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { kundliService } from '@/lib/services/kundli.service';
import { cn } from '@/utils/cn';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

// ─── Types for mapped report data ──────────────────────────────────
interface NakshatraInfo {
  name: string;
  lord: string;
  pada: number;
  deity?: string;
  symbol?: string;
  ganam?: string;
  nadi?: string;
  animal?: string;
  syllables?: string;
}

interface RasiInfo {
  name: string;
  lord: string;
  element?: string;
}

interface LagnaInfo {
  name: string;
  lord: string;
  degree?: number;
}

interface PlanetInfo {
  name: string;
  sign: string;
  signLord?: string;
  degree: number;
  degreeFormatted?: string;
  isRetrograde: boolean;
  isCombust?: boolean;
  isExalted?: boolean;
  isDebilitated?: boolean;
  house: number;
  nakshatra?: string;
  nakshatraLord?: string;
  nakshatraPada?: number;
}

interface YogaInfo {
  name: string;
  hasYoga: boolean;
  description: string;
  effects?: string;
  strength?: 'strong' | 'moderate' | 'weak';
}

interface DoshaInfo {
  hasDosha: boolean;
  severity?: string;
  type?: string;
  description: string;
  remedies: string[];
  affectedHouses?: number[];
  exceptions?: string[];
}

interface SadeSatiInfo {
  isActive: boolean;
  phase: string;
  description?: string;
  startDate: string;
  endDate: string;
}

interface DashaPeriod {
  planet: string;
  startDate: string;
  endDate: string;
  durationYears?: number;
  isCurrent?: boolean;
}

interface CurrentDasha {
  mahadasha: { planet: string; startDate: string; endDate: string; yearsRemaining?: number; totalYears?: number };
  antardasha: { planet: string; startDate: string; endDate: string; monthsRemaining?: number };
  pratyantardasha?: { planet: string; startDate: string; endDate: string; daysRemaining?: number };
}

interface GemstoneInfo {
  name: string;
  planet?: string;
  finger: string;
  hand?: string;
  metal: string;
  weight?: string;
  day?: string;
  time?: string;
  mantra?: string;
}

interface RemediesData {
  gemstone: GemstoneInfo;
  luckyColors: string[];
  luckyNumbers: number[];
  luckyDays: string[];
  luckyDirection?: string;
  mantras: (string | { mantra: string; planet?: string; count?: number })[];
  charities?: (string | { item: string; day: string; recipient?: string })[];
  fasting?: { day: string; deity?: string };
  rudrakshas?: string[];
  yantras?: string[];
}

interface PredictionsData {
  general: string;
  career?: string;
  love?: string;
  health?: string;
  finance?: string;
  family?: string;
  education?: string;
}

interface ChartData {
  rasiChart?: { svgUrl?: string; svgUrlNorth?: string; chartName?: string };
  navamsaChart?: { svgUrl?: string; svgUrlNorth?: string; chartName?: string };
  dasamsaChart?: { svgUrl?: string; svgUrlNorth?: string; chartName?: string };
}

interface KundliReportData {
  nakshatra: NakshatraInfo;
  rasi: RasiInfo;
  lagna: LagnaInfo;
  sunSign?: string;
  moonSign?: string;
  planets: PlanetInfo[];
  yogas?: YogaInfo[];
  charts?: ChartData;
  mangalDosha: DoshaInfo;
  kaalSarpDosha: DoshaInfo;
  sadeSati: SadeSatiInfo;
  currentDasha: CurrentDasha;
  dashaPeriods: DashaPeriod[];
  remedies: RemediesData;
  predictions: PredictionsData;
}

// ─── Helpers ───────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiReportToData(report: any): KundliReportData {
  return {
    nakshatra: {
      name: report.basicInfo?.nakshatra?.name || 'Unknown',
      lord: report.basicInfo?.nakshatra?.lord || 'Unknown',
      pada: report.basicInfo?.nakshatra?.pada || 1,
      deity: report.basicInfo?.nakshatra?.deity,
      symbol: report.basicInfo?.nakshatra?.symbol,
      ganam: report.basicInfo?.nakshatra?.ganam,
      nadi: report.basicInfo?.nakshatra?.nadi,
      animal: report.basicInfo?.nakshatra?.animal,
      syllables: report.basicInfo?.nakshatra?.syllables,
    },
    rasi: {
      name: report.basicInfo?.rasi?.name || 'Unknown',
      lord: report.basicInfo?.rasi?.lord || 'Unknown',
      element: report.basicInfo?.rasi?.element,
    },
    lagna: {
      name: report.basicInfo?.lagna?.name || 'Unknown',
      lord: report.basicInfo?.lagna?.lord || 'Unknown',
      degree: report.basicInfo?.lagna?.degree,
    },
    sunSign: report.basicInfo?.sunSign,
    moonSign: report.basicInfo?.moonSign,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    planets: (Array.isArray(report.planets) ? report.planets : []).map((p: any) => ({
      name: p.name,
      sign: p.sign,
      signLord: p.signLord,
      degree: p.degree || 0,
      degreeFormatted: p.degreeFormatted,
      isRetrograde: p.isRetrograde || false,
      isCombust: p.isCombust,
      isExalted: p.isExalted,
      isDebilitated: p.isDebilitated,
      house: p.house || 0,
      nakshatra: p.nakshatra,
      nakshatraLord: p.nakshatraLord,
      nakshatraPada: p.nakshatraPada,
    })),
    yogas: report.yogas,
    charts: report.charts,
    mangalDosha: {
      hasDosha: report.doshas?.mangalDosha?.hasDosha || false,
      severity: report.doshas?.mangalDosha?.severity || 'none',
      type: report.doshas?.mangalDosha?.type,
      description: report.doshas?.mangalDosha?.description || 'Unable to calculate',
      remedies: report.doshas?.mangalDosha?.remedies || [],
      affectedHouses: report.doshas?.mangalDosha?.affectedHouses,
      exceptions: report.doshas?.mangalDosha?.exceptions,
    },
    kaalSarpDosha: {
      hasDosha: report.doshas?.kaalSarpDosha?.hasDosha || false,
      severity: report.doshas?.kaalSarpDosha?.severity || 'none',
      type: report.doshas?.kaalSarpDosha?.type || 'None',
      description: report.doshas?.kaalSarpDosha?.description || 'Unable to calculate',
      remedies: report.doshas?.kaalSarpDosha?.remedies || [],
    },
    sadeSati: {
      isActive: report.doshas?.sadeSati?.isActive || false,
      phase: report.doshas?.sadeSati?.phase || 'None',
      description: report.doshas?.sadeSati?.description,
      startDate: report.doshas?.sadeSati?.startDate || '',
      endDate: report.doshas?.sadeSati?.endDate || '',
    },
    currentDasha: {
      mahadasha: {
        planet: report.dasha?.current?.mahadasha?.planet || 'Unknown',
        startDate: report.dasha?.current?.mahadasha?.startDate || '',
        endDate: report.dasha?.current?.mahadasha?.endDate || '',
        yearsRemaining: report.dasha?.current?.mahadasha?.yearsRemaining,
        totalYears: report.dasha?.current?.mahadasha?.totalYears,
      },
      antardasha: {
        planet: report.dasha?.current?.antardasha?.planet || 'Unknown',
        startDate: report.dasha?.current?.antardasha?.startDate || '',
        endDate: report.dasha?.current?.antardasha?.endDate || '',
        monthsRemaining: report.dasha?.current?.antardasha?.monthsRemaining,
      },
      pratyantardasha: report.dasha?.current?.pratyantardasha
        ? {
            planet: report.dasha.current.pratyantardasha.planet,
            startDate: report.dasha.current.pratyantardasha.startDate,
            endDate: report.dasha.current.pratyantardasha.endDate,
            daysRemaining: report.dasha.current.pratyantardasha.daysRemaining,
          }
        : undefined,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dashaPeriods: (report.dasha?.timeline || []).map((t: any) => ({
      planet: t.planet,
      startDate: t.startDate,
      endDate: t.endDate,
      durationYears: t.durationYears,
      isCurrent: t.isCurrent,
    })),
    remedies: {
      gemstone: {
        name: report.remedies?.gemstone?.name || 'Unknown',
        planet: report.remedies?.gemstone?.planet,
        finger: report.remedies?.gemstone?.finger || 'Unknown',
        hand: report.remedies?.gemstone?.hand,
        metal: report.remedies?.gemstone?.metal || 'Unknown',
        weight: report.remedies?.gemstone?.weight,
        day: report.remedies?.gemstone?.day,
        time: report.remedies?.gemstone?.time,
        mantra: report.remedies?.gemstone?.mantra,
      },
      luckyColors: report.remedies?.luckyColors || [],
      luckyNumbers: report.remedies?.luckyNumbers || [],
      luckyDays: report.remedies?.luckyDays || [],
      luckyDirection: report.remedies?.luckyDirection,
      mantras: report.remedies?.mantras || [],
      charities: report.remedies?.charities,
      fasting: report.remedies?.fasting,
      rudrakshas: report.remedies?.rudrakshas,
      yantras: report.remedies?.yantras,
    },
    predictions: {
      general: report.predictions?.general || 'Your birth chart analysis is being processed.',
      career: report.predictions?.career,
      love: report.predictions?.love,
      health: report.predictions?.health,
      finance: report.predictions?.finance,
      family: report.predictions?.family,
      education: report.predictions?.education,
    },
  };
}

// Tab configuration
type KundliTab = 'general' | 'remedies' | 'dosha' | 'charts' | 'dasha';

const TABS: { key: KundliTab; label: string; icon: React.ElementType }[] = [
  { key: 'general', label: 'General', icon: Star },
  { key: 'remedies', label: 'Remedies', icon: Gem },
  { key: 'dosha', label: 'Dosha', icon: AlertTriangle },
  { key: 'charts', label: 'Charts', icon: Grid3X3 },
  { key: 'dasha', label: 'Dasha', icon: Clock },
];

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const getMantraText = (mantra: string | { mantra: string }): string => {
  return typeof mantra === 'string' ? mantra : mantra.mantra;
};

const getCharityText = (charity: string | { item: string; day: string; recipient?: string }): string => {
  if (typeof charity === 'string') return charity;
  return `${charity.item} on ${charity.day}${charity.recipient ? ` to ${charity.recipient}` : ''}`;
};

// ─── Tab Components ────────────────────────────────────────────────

function GeneralTab({ data }: { data: KundliReportData }) {
  const PREDICTION_SECTIONS = [
    { key: 'general' as const, label: 'General', icon: Star },
    { key: 'career' as const, label: 'Career', icon: Briefcase },
    { key: 'love' as const, label: 'Love & Relationships', icon: Heart },
    { key: 'health' as const, label: 'Health', icon: Activity },
    { key: 'finance' as const, label: 'Finance', icon: Wallet },
    { key: 'family' as const, label: 'Family', icon: Users },
    { key: 'education' as const, label: 'Education', icon: GraduationCap },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Birth Details */}
      <Card className="p-4">
        <h3 className="text-base font-semibold text-text-primary mb-4 font-lexend">
          Birth Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-text-muted font-lexend">Nakshatra</p>
            <p className="text-sm font-medium text-text-primary font-lexend">
              {data.nakshatra.name} (Pada {data.nakshatra.pada})
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted font-lexend">Rasi</p>
            <p className="text-sm font-medium text-text-primary font-lexend">
              {data.rasi.name}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted font-lexend">Lagna</p>
            <p className="text-sm font-medium text-text-primary font-lexend">
              {data.lagna.name}
            </p>
          </div>
          {data.nakshatra.deity && (
            <div>
              <p className="text-xs text-text-muted font-lexend">Deity</p>
              <p className="text-sm font-medium text-text-primary font-lexend">
                {data.nakshatra.deity}
              </p>
            </div>
          )}
          {data.nakshatra.ganam && (
            <div>
              <p className="text-xs text-text-muted font-lexend">Gana</p>
              <p className="text-sm font-medium text-text-primary font-lexend">
                {data.nakshatra.ganam}
              </p>
            </div>
          )}
          {data.nakshatra.nadi && (
            <div>
              <p className="text-xs text-text-muted font-lexend">Nadi</p>
              <p className="text-sm font-medium text-text-primary font-lexend">
                {data.nakshatra.nadi}
              </p>
            </div>
          )}
          {data.sunSign && (
            <div>
              <p className="text-xs text-text-muted font-lexend">Sun Sign</p>
              <p className="text-sm font-medium text-text-primary font-lexend">
                {data.sunSign}
              </p>
            </div>
          )}
          {data.moonSign && (
            <div>
              <p className="text-xs text-text-muted font-lexend">Moon Sign</p>
              <p className="text-sm font-medium text-text-primary font-lexend">
                {data.moonSign}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Yogas */}
      {data.yogas && data.yogas.filter((y) => y.hasYoga).length > 0 && (
        <Card className="p-4">
          <h3 className="text-base font-semibold text-text-primary mb-4 font-lexend">
            Yogas
          </h3>
          <div className="space-y-3">
            {data.yogas
              .filter((y) => y.hasYoga)
              .map((yoga, index) => (
                <div
                  key={index}
                  className="p-3 bg-primary/5 rounded-lg border border-primary/10"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-text-primary font-lexend">
                      {yoga.name}
                    </p>
                    {yoga.strength && (
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium capitalize font-lexend',
                          yoga.strength === 'strong'
                            ? 'bg-green-100 text-green-700'
                            : yoga.strength === 'moderate'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {yoga.strength}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary font-lexend">
                    {yoga.description}
                  </p>
                  {yoga.effects && (
                    <p className="text-xs text-text-muted mt-1 font-lexend">
                      Effects: {yoga.effects}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Predictions */}
      {PREDICTION_SECTIONS.map(({ key, label, icon: Icon }) => {
        const text = data.predictions[key];
        if (!text) return null;
        return (
          <Card key={key} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-4 h-4 text-primary" />
              <h3 className="text-base font-semibold text-text-primary font-lexend">
                {label}
              </h3>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed font-lexend">
              {text}
            </p>
          </Card>
        );
      })}

      {/* Planetary Positions */}
      {data.planets.length > 0 && (
        <Card className="p-4">
          <h3 className="text-base font-semibold text-text-primary mb-4 font-lexend">
            Planetary Positions
          </h3>
          <div className="divide-y">
            {data.planets.map((planet, index) => (
              <div key={index} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary font-lexend">
                    {planet.name}
                  </span>
                  <div className="flex gap-1">
                    {planet.isRetrograde && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-lexend">
                        R
                      </span>
                    )}
                    {planet.isExalted && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-lexend">
                        Ex
                      </span>
                    )}
                    {planet.isDebilitated && (
                      <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-lexend">
                        Db
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-secondary font-lexend">
                    {planet.sign} - {planet.degreeFormatted || `${planet.degree.toFixed(1)}°`}
                  </p>
                  {planet.nakshatra && (
                    <p className="text-xs text-text-muted font-lexend">
                      {planet.nakshatra}
                      {planet.nakshatraPada ? ` (${planet.nakshatraPada})` : ''}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
}

function RemediesTab({ data }: { data: KundliReportData }) {
  const { remedies } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Gemstone */}
      {remedies.gemstone.name !== 'Unknown' && (
        <Card className="p-4">
          <h3 className="text-base font-semibold text-text-primary mb-4 font-lexend">
            Recommended Gemstone
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
              <Gem className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-text-primary font-lexend">
                {remedies.gemstone.name}
              </p>
              <p className="text-sm text-text-secondary font-lexend">
                Wear on {remedies.gemstone.finger} finger in {remedies.gemstone.metal}
              </p>
              {remedies.gemstone.weight && (
                <p className="text-xs text-text-muted font-lexend mt-0.5">
                  Weight: {remedies.gemstone.weight}
                </p>
              )}
              {remedies.gemstone.day && (
                <p className="text-xs text-text-muted font-lexend">
                  Best day: {remedies.gemstone.day}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Lucky Colors */}
      {remedies.luckyColors.length > 0 && (
        <Card className="p-4">
          <h3 className="text-base font-semibold text-text-primary mb-3 font-lexend">
            Lucky Colors
          </h3>
          <div className="flex flex-wrap gap-2">
            {remedies.luckyColors.map((color, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium font-lexend"
              >
                {color}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Lucky Numbers */}
      {remedies.luckyNumbers.length > 0 && (
        <Card className="p-4">
          <h3 className="text-base font-semibold text-text-primary mb-3 font-lexend">
            Lucky Numbers
          </h3>
          <div className="flex flex-wrap gap-2">
            {remedies.luckyNumbers.map((num, index) => (
              <span
                key={index}
                className="w-10 h-10 bg-secondary/20 text-text-primary rounded-full flex items-center justify-center text-sm font-semibold font-lexend"
              >
                {num}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Lucky Days */}
      {remedies.luckyDays.length > 0 && (
        <Card className="p-4">
          <h3 className="text-base font-semibold text-text-primary mb-3 font-lexend">
            Lucky Days
          </h3>
          <div className="flex flex-wrap gap-2">
            {remedies.luckyDays.map((day, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium font-lexend"
              >
                {day}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Lucky Direction */}
      {remedies.luckyDirection && (
        <Card className="p-4">
          <h3 className="text-base font-semibold text-text-primary mb-3 font-lexend">
            Lucky Direction
          </h3>
          <p className="text-sm text-text-secondary font-lexend">{remedies.luckyDirection}</p>
        </Card>
      )}

      {/* Mantras */}
      {remedies.mantras.length > 0 && (
        <Card className="p-4">
          <h3 className="text-base font-semibold text-text-primary mb-3 font-lexend">
            Recommended Mantras
          </h3>
          <div className="space-y-2">
            {remedies.mantras.map((mantra, index) => (
              <div
                key={index}
                className="p-3 bg-primary/5 rounded-lg border-l-4 border-primary"
              >
                <p className="text-sm text-text-primary italic font-lexend">
                  {getMantraText(mantra)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Charities */}
      {remedies.charities && remedies.charities.length > 0 && (
        <Card className="p-4">
          <h3 className="text-base font-semibold text-text-primary mb-3 font-lexend">
            Recommended Charities
          </h3>
          <div className="space-y-2">
            {remedies.charities.map((charity, index) => (
              <div key={index} className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-text-primary font-lexend">
                  {getCharityText(charity)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Fasting */}
      {remedies.fasting && (
        <Card className="p-4">
          <h3 className="text-base font-semibold text-text-primary mb-3 font-lexend">
            Recommended Fasting
          </h3>
          <p className="text-sm text-text-secondary font-lexend">
            Fast on {remedies.fasting.day}
            {remedies.fasting.deity ? ` (dedicated to ${remedies.fasting.deity})` : ''}
          </p>
        </Card>
      )}

      {/* Rudrakshas */}
      {remedies.rudrakshas && remedies.rudrakshas.length > 0 && (
        <Card className="p-4">
          <h3 className="text-base font-semibold text-text-primary mb-3 font-lexend">
            Recommended Rudrakshas
          </h3>
          <div className="flex flex-wrap gap-2">
            {remedies.rudrakshas.map((rudraksha, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium font-lexend"
              >
                {rudraksha}
              </span>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
}

function DoshaTab({ data }: { data: KundliReportData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Mangal Dosha */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              data.mangalDosha.hasDosha ? 'bg-red-100' : 'bg-green-100'
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 ${data.mangalDosha.hasDosha ? 'text-red-600' : 'text-green-600'}`}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-text-primary font-lexend">
              Mangal Dosha
            </h3>
            <p
              className={`text-sm font-medium mt-1 font-lexend ${
                data.mangalDosha.hasDosha ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {data.mangalDosha.hasDosha ? 'Present' : 'Not Present'}
              {data.mangalDosha.severity && data.mangalDosha.severity !== 'none' && (
                <span className="ml-1 capitalize">({data.mangalDosha.severity})</span>
              )}
            </p>
            <p className="text-sm text-text-secondary mt-2 font-lexend">
              {data.mangalDosha.description}
            </p>
            {data.mangalDosha.remedies.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-text-primary mb-1 font-lexend">Remedies:</p>
                <ul className="space-y-1">
                  {data.mangalDosha.remedies.map((remedy, i) => (
                    <li key={i} className="text-xs text-text-secondary font-lexend flex gap-1.5">
                      <span className="text-primary mt-0.5">•</span>
                      {remedy}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Kaal Sarp Dosha */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              data.kaalSarpDosha.hasDosha ? 'bg-red-100' : 'bg-green-100'
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 ${data.kaalSarpDosha.hasDosha ? 'text-red-600' : 'text-green-600'}`}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-text-primary font-lexend">
              Kaal Sarp Dosha
            </h3>
            <p
              className={`text-sm font-medium mt-1 font-lexend ${
                data.kaalSarpDosha.hasDosha ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {data.kaalSarpDosha.hasDosha
                ? `Present (${data.kaalSarpDosha.type})`
                : 'Not Present'}
            </p>
            <p className="text-sm text-text-secondary mt-2 font-lexend">
              {data.kaalSarpDosha.description}
            </p>
            {data.kaalSarpDosha.remedies.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-text-primary mb-1 font-lexend">Remedies:</p>
                <ul className="space-y-1">
                  {data.kaalSarpDosha.remedies.map((remedy, i) => (
                    <li key={i} className="text-xs text-text-secondary font-lexend flex gap-1.5">
                      <span className="text-primary mt-0.5">•</span>
                      {remedy}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Sade Sati */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              data.sadeSati.isActive ? 'bg-amber-100' : 'bg-green-100'
            }`}
          >
            <Clock
              className={`w-5 h-5 ${data.sadeSati.isActive ? 'text-amber-600' : 'text-green-600'}`}
            />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary font-lexend">
              Sade Sati
            </h3>
            <p
              className={`text-sm font-medium mt-1 font-lexend ${
                data.sadeSati.isActive ? 'text-amber-600' : 'text-green-600'
              }`}
            >
              {data.sadeSati.isActive
                ? `Active (${data.sadeSati.phase} Phase)`
                : 'Not Active'}
            </p>
            {data.sadeSati.description && (
              <p className="text-sm text-text-secondary mt-2 font-lexend">
                {data.sadeSati.description}
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function ChartsTab({ data }: { data: KundliReportData }) {
  const charts = data.charts;
  const chartEntries = [
    { key: 'rasiChart', label: 'Rasi Chart (Lagna)' },
    { key: 'navamsaChart', label: 'Navamsa Chart' },
    { key: 'dasamsaChart', label: 'Dasamsa Chart' },
  ] as const;

  const hasAnyChart = charts && chartEntries.some(
    (c) => charts[c.key]?.svgUrl || charts[c.key]?.svgUrlNorth
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {hasAnyChart ? (
        chartEntries.map(({ key, label }) => {
          const chart = charts?.[key];
          const svgUrl = chart?.svgUrl || chart?.svgUrlNorth;
          if (!svgUrl) return null;
          return (
            <Card key={key} className="p-4">
              <h3 className="text-base font-semibold text-text-primary mb-4 font-lexend">
                {chart?.chartName || label}
              </h3>
              <div className="bg-gray-50 rounded-lg p-2 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={svgUrl}
                  alt={label}
                  className="max-w-full h-auto"
                  style={{ maxHeight: '400px' }}
                />
              </div>
            </Card>
          );
        })
      ) : (
        <Card className="p-6 text-center">
          <Grid3X3 className="w-10 h-10 text-text-muted/40 mx-auto mb-2" />
          <p className="text-text-secondary font-lexend">
            No chart data available for this report.
          </p>
        </Card>
      )}
    </motion.div>
  );
}

function DashaTab({ data }: { data: KundliReportData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Current Dasha */}
      {data.currentDasha.mahadasha.planet !== 'Unknown' && (
        <Card className="p-4 bg-primary/5 border-2 border-primary/20">
          <h3 className="text-base font-semibold text-text-primary mb-4 font-lexend">
            Current Dasha Period
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-text-muted font-lexend">Mahadasha</p>
              <p className="text-lg font-semibold text-primary font-lexend">
                {data.currentDasha.mahadasha.planet}
              </p>
              {data.currentDasha.mahadasha.startDate && (
                <p className="text-xs text-text-secondary font-lexend">
                  {formatDate(data.currentDasha.mahadasha.startDate)} -{' '}
                  {formatDate(data.currentDasha.mahadasha.endDate)}
                </p>
              )}
              {data.currentDasha.mahadasha.yearsRemaining !== undefined && (
                <p className="text-xs text-primary font-lexend mt-0.5">
                  {data.currentDasha.mahadasha.yearsRemaining} years remaining
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-text-muted font-lexend">Antardasha</p>
              <p className="text-base font-semibold text-text-primary font-lexend">
                {data.currentDasha.antardasha.planet}
              </p>
              {data.currentDasha.antardasha.startDate && (
                <p className="text-xs text-text-secondary font-lexend">
                  {formatDate(data.currentDasha.antardasha.startDate)} -{' '}
                  {formatDate(data.currentDasha.antardasha.endDate)}
                </p>
              )}
            </div>
            {data.currentDasha.pratyantardasha && (
              <div>
                <p className="text-xs text-text-muted font-lexend">Pratyantardasha</p>
                <p className="text-sm font-semibold text-text-primary font-lexend">
                  {data.currentDasha.pratyantardasha.planet}
                </p>
                {data.currentDasha.pratyantardasha.startDate && (
                  <p className="text-xs text-text-secondary font-lexend">
                    {formatDate(data.currentDasha.pratyantardasha.startDate)} -{' '}
                    {formatDate(data.currentDasha.pratyantardasha.endDate)}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Dasha Periods Timeline */}
      {data.dashaPeriods.length > 0 && (
        <Card className="p-4">
          <h3 className="text-base font-semibold text-text-primary mb-4 font-lexend">
            Mahadasha Periods
          </h3>
          <div className="space-y-3">
            {data.dashaPeriods.map((period, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center justify-between py-3 border-b last:border-0',
                  period.isCurrent && 'bg-primary/5 -mx-2 px-2 rounded-lg border-b-0'
                )}
              >
                <div>
                  <p className="text-sm font-semibold text-text-primary font-lexend">
                    {period.planet}
                    {period.isCurrent && (
                      <span className="ml-2 text-xs text-primary font-normal">(Current)</span>
                    )}
                  </p>
                  <p className="text-xs text-text-secondary font-lexend">
                    {formatDate(period.startDate)} - {formatDate(period.endDate)}
                  </p>
                </div>
                {period.durationYears !== undefined && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded font-lexend">
                    {period.durationYears} years
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {data.currentDasha.mahadasha.planet === 'Unknown' && data.dashaPeriods.length === 0 && (
        <Card className="p-6 text-center">
          <Clock className="w-10 h-10 text-text-muted/40 mx-auto mb-2" />
          <p className="text-text-secondary font-lexend">No Dasha data available.</p>
        </Card>
      )}
    </motion.div>
  );
}

// ─── Main Page Component ───────────────────────────────────────────

export default function KundliReportPage() {
  const params = useParams();
  const kundliId = params.id as string;
  const [activeTab, setActiveTab] = useState<KundliTab>('general');

  // Auth check
  const { isReady } = useRequireAuth();

  // Fetch kundli details
  const { data: kundliData, isLoading: isKundliLoading } = useQuery({
    queryKey: ['kundli', kundliId],
    queryFn: async () => {
      return kundliService.getKundliById(kundliId);
    },
    enabled: isReady && !!kundliId,
  });

  // Fetch kundli report with language & chartStyle params (matching mobile app)
  const {
    data: reportData,
    isLoading: isReportLoading,
    isError: isReportError,
    error: reportError,
    refetch: refetchReport,
    isFetching: isReportRefetching,
  } = useQuery({
    queryKey: ['kundli-report', kundliId],
    queryFn: async () => {
      return kundliService.getKundliReport(kundliId, {
        language: 'en',
        chartStyle: 'south_indian',
      });
    },
    enabled: isReady && !!kundliId,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  });

  const kundli = kundliData?.data;

  // Map the raw API response to our display data structure (same as mobile app's mapReportData)
  const reportDisplayData = useMemo(() => {
    const raw = reportData?.data;
    if (!raw) return null;
    return mapApiReportToData(raw);
  }, [reportData]);

  const isLoading = !isReady || isKundliLoading;

  // Render tab content
  const renderTabContent = useMemo(() => {
    if (!reportDisplayData) return null;

    switch (activeTab) {
      case 'general':
        return <GeneralTab data={reportDisplayData} />;
      case 'remedies':
        return <RemediesTab data={reportDisplayData} />;
      case 'dosha':
        return <DoshaTab data={reportDisplayData} />;
      case 'charts':
        return <ChartsTab data={reportDisplayData} />;
      case 'dasha':
        return <DashaTab data={reportDisplayData} />;
      default:
        return null;
    }
  }, [activeTab, reportDisplayData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-offWhite">
        <PageContainer size="md">
          <div className="py-4">
            <Skeleton className="w-64 h-5 mb-6" />
            <Skeleton className="w-48 h-8 mb-2" />
            <Skeleton className="w-72 h-4 mb-6" />
            <div className="flex gap-4 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="w-20 h-8" />
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-offWhite">
      <PageContainer size="md">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Kundli Reports', href: '/kundli-reports' },
            { label: 'Report Details' },
          ]}
        />

        {/* Page Title */}
        <h1 className="text-2xl font-bold text-text-primary font-lexend mb-1">
          {kundli?.name || 'Kundli Report'}
        </h1>
        {kundli && (
          <p className="text-sm text-text-secondary font-lexend mb-6">
            {formatDate(kundli.dateOfBirth)}, {kundli.timeOfBirth} |{' '}
            {kundli.birthPlace?.name || kundli.placeOfBirth || ''}
          </p>
        )}

        {/* Underline-style Tab Bar */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors font-lexend relative',
                activeTab === tab.key
                  ? 'text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="kundli-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="pb-8">
          {isReportLoading || isReportRefetching ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-sm text-text-secondary font-lexend">
                {isReportRefetching ? 'Retrying...' : 'Loading your Kundli report...'}
              </p>
              <p className="text-xs text-text-muted mt-1 font-lexend">
                This may take a moment
              </p>
            </div>
          ) : isReportError ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary font-lexend mb-2">
                Report Generation Failed
              </h3>
              <p className="text-sm text-text-secondary text-center max-w-sm font-lexend mb-1">
                We couldn&apos;t generate your Kundli report at this time. This may be a temporary
                issue with the server.
              </p>
              <p className="text-xs text-text-muted text-center mb-6 font-lexend">
                {reportError instanceof Error ? reportError.message : 'Internal server error'}
              </p>
              <Button variant="primary" onClick={() => refetchReport()} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
            </div>
          ) : (
            <AnimatePresence mode="wait">{renderTabContent}</AnimatePresence>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
