'use client';

/**
 * Kundli Report Detail Page
 * Displays generated Kundli report with 5 tabs: General | Remedies | Dosha | Charts | Dasha
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Gem, AlertTriangle, Grid3X3, Clock } from 'lucide-react';
import { Button, Card, Skeleton } from '@/components/ui';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { kundliService } from '@/lib/services/kundli.service';
import { shouldUseMockData } from '@/lib/mock';
import { KundliReport, Kundli } from '@/types/api.types';

// Tab configuration
type KundliTab = 'general' | 'remedies' | 'dosha' | 'charts' | 'dasha';

const TABS: { key: KundliTab; label: string; icon: React.ElementType }[] = [
  { key: 'general', label: 'General', icon: Star },
  { key: 'remedies', label: 'Remedies', icon: Gem },
  { key: 'dosha', label: 'Dosha', icon: AlertTriangle },
  { key: 'charts', label: 'Charts', icon: Grid3X3 },
  { key: 'dasha', label: 'Dasha', icon: Clock },
];

// Mock Kundli data
const MOCK_KUNDLI: Kundli = {
  id: 'kundli-1',
  userId: 'user-1',
  name: 'Rahul Kumar',
  dateOfBirth: '1990-05-15',
  timeOfBirth: '10:30',
  placeOfBirth: 'Mumbai, Maharashtra',
  createdAt: '2024-01-15T10:00:00.000Z',
};

// Mock Kundli Report data
const MOCK_REPORT: KundliReport = {
  kundliId: 'kundli-1',
  basicInfo: {
    nakshatra: { name: 'Ashwini', lord: 'Ketu', pada: 2 },
    rasi: { name: 'Aries', lord: 'Mars' },
    lagna: { name: 'Leo', lord: 'Sun' },
    sunSign: 'Taurus',
    moonSign: 'Aries',
  },
  planets: {
    positions: [
      { name: 'Sun', sign: 'Aries', degree: 15.5, isRetrograde: false, house: 9 },
      { name: 'Moon', sign: 'Taurus', degree: 22.3, isRetrograde: false, house: 10 },
      { name: 'Mars', sign: 'Capricorn', degree: 8.7, isRetrograde: false, house: 6 },
      { name: 'Mercury', sign: 'Pisces', degree: 28.1, isRetrograde: true, house: 8 },
      { name: 'Jupiter', sign: 'Sagittarius', degree: 12.4, isRetrograde: false, house: 5 },
      { name: 'Venus', sign: 'Aquarius', degree: 5.9, isRetrograde: false, house: 7 },
      { name: 'Saturn', sign: 'Capricorn', degree: 20.2, isRetrograde: false, house: 6 },
      { name: 'Rahu', sign: 'Gemini', degree: 18.8, isRetrograde: true, house: 11 },
      { name: 'Ketu', sign: 'Sagittarius', degree: 18.8, isRetrograde: true, house: 5 },
    ],
  },
  charts: {
    lagnaChart: 'https://via.placeholder.com/300x300?text=Lagna+Chart',
    moonChart: 'https://via.placeholder.com/300x300?text=Moon+Chart',
    navamsaChart: 'https://via.placeholder.com/300x300?text=Navamsa+Chart',
  },
  doshas: {
    mangalDosha: {
      hasDosha: false,
      severity: 'none',
      description: 'Mars is well-placed in your chart, indicating no Mangal Dosha.',
      remedies: [],
    },
    kaalSarpDosha: {
      hasDosha: false,
      severity: 'none',
      type: 'None',
      description: 'No Kaal Sarp Dosha is present in your birth chart.',
      remedies: [],
    },
    sadeSati: {
      isActive: false,
      phase: 'None',
      startDate: '',
      endDate: '',
    },
    predictions: {
      general:
        "The sun in your chart brings intense focus, while passionate energy drives determination. Jupiter's placement indicates wisdom and spiritual growth. Your chart shows strong potential for success in education, teaching, and advisory roles.",
      career:
        'Your career path is aligned with creativity and leadership. Jupiter in the 5th house brings opportunities in education, arts, or entertainment.',
      love: 'Venus in the 7th house indicates a harmonious married life. You may meet your partner through social gatherings.',
      health:
        'Overall health is good. Pay attention to digestive issues due to Saturn in the 6th house.',
    },
    remedies: {
      gemstone: { name: 'Yellow Sapphire', finger: 'Index', metal: 'Gold' },
      luckyColors: ['Yellow', 'Orange', 'Gold'],
      luckyNumbers: [3, 9, 12],
      luckyDays: ['Thursday', 'Sunday'],
      mantras: ['Om Guru Devaya Namaha', 'Om Brim Brihaspataye Namaha'],
    },
    currentDasha: {
      mahadasha: { planet: 'Jupiter', startDate: '2020-03-15', endDate: '2036-03-15' },
      antardasha: { planet: 'Saturn', startDate: '2024-01-20', endDate: '2026-08-15' },
    },
    dashaPeriods: [
      { planet: 'Jupiter', startDate: '2020-03-15', endDate: '2036-03-15', durationYears: 16 },
      { planet: 'Saturn', startDate: '2036-03-15', endDate: '2055-03-15', durationYears: 19 },
      { planet: 'Mercury', startDate: '2055-03-15', endDate: '2072-03-15', durationYears: 17 },
    ],
  },
};

// Helper function to format dates
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

// General Tab Component
function GeneralTab({ report }: { report: KundliReport }) {
  const basicInfo = report.basicInfo as Record<string, unknown>;
  const planets = report.planets as { positions: Array<Record<string, unknown>> };
  const doshas = report.doshas as Record<string, unknown>;
  const predictions = (doshas?.predictions as Record<string, string>) || {};
  const nakshatra = basicInfo?.nakshatra as { name: string; pada: number } | undefined;
  const rasi = basicInfo?.rasi as { name: string } | undefined;
  const lagna = basicInfo?.lagna as { name: string } | undefined;

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
              {nakshatra?.name || 'N/A'} {nakshatra?.pada ? `(Pada ${nakshatra.pada})` : ''}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted font-lexend">Rasi</p>
            <p className="text-sm font-medium text-text-primary font-lexend">
              {rasi?.name || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted font-lexend">Lagna</p>
            <p className="text-sm font-medium text-text-primary font-lexend">
              {lagna?.name || 'N/A'}
            </p>
          </div>
          {typeof basicInfo?.sunSign === 'string' && (
            <div>
              <p className="text-xs text-text-muted font-lexend">Sun Sign</p>
              <p className="text-sm font-medium text-text-primary font-lexend">
                {basicInfo.sunSign}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* General Prediction */}
      {predictions?.general && (
        <Card className="p-4">
          <h3 className="text-base font-semibold text-text-primary mb-3 font-lexend">
            General
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed font-lexend">
            {predictions.general}
          </p>
        </Card>
      )}

      {/* Career Prediction */}
      {predictions?.career && (
        <Card className="p-4">
          <h3 className="text-base font-semibold text-text-primary mb-3 font-lexend">
            Career
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed font-lexend">
            {predictions.career}
          </p>
        </Card>
      )}

      {/* Planetary Positions */}
      {planets?.positions && (
        <Card className="p-4">
          <h3 className="text-base font-semibold text-text-primary mb-4 font-lexend">
            Planetary Positions
          </h3>
          <div className="divide-y">
            {planets.positions.map((planet, index) => (
              <div key={index} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary font-lexend">
                    {planet.name as string}
                  </span>
                  {Boolean(planet.isRetrograde) && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-lexend">
                      R
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-secondary font-lexend">
                    {planet.sign as string} - {(planet.degree as number).toFixed(1)}°
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
}

// Remedies Tab Component
function RemediesTab({ report }: { report: KundliReport }) {
  const doshas = report.doshas as Record<string, unknown>;
  const remedies = doshas?.remedies as Record<string, unknown>;
  const gemstone = remedies?.gemstone as { name: string; finger: string; metal: string } | undefined;
  const luckyColors = (remedies?.luckyColors as string[]) || [];
  const luckyNumbers = (remedies?.luckyNumbers as number[]) || [];
  const luckyDays = (remedies?.luckyDays as string[]) || [];
  const mantras = (remedies?.mantras as string[]) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Gemstone */}
      {gemstone && (
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
                {gemstone.name}
              </p>
              <p className="text-sm text-text-secondary font-lexend">
                Wear on {gemstone.finger} finger in {gemstone.metal}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Lucky Colors */}
      {luckyColors.length > 0 && (
        <Card className="p-4">
          <h3 className="text-base font-semibold text-text-primary mb-3 font-lexend">
            Lucky Colors
          </h3>
          <div className="flex flex-wrap gap-2">
            {luckyColors.map((color, index) => (
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
      {luckyNumbers.length > 0 && (
        <Card className="p-4">
          <h3 className="text-base font-semibold text-text-primary mb-3 font-lexend">
            Lucky Numbers
          </h3>
          <div className="flex flex-wrap gap-2">
            {luckyNumbers.map((num, index) => (
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
      {luckyDays.length > 0 && (
        <Card className="p-4">
          <h3 className="text-base font-semibold text-text-primary mb-3 font-lexend">
            Lucky Days
          </h3>
          <div className="flex flex-wrap gap-2">
            {luckyDays.map((day, index) => (
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

      {/* Mantras */}
      {mantras.length > 0 && (
        <Card className="p-4">
          <h3 className="text-base font-semibold text-text-primary mb-3 font-lexend">
            Recommended Mantras
          </h3>
          <div className="space-y-2">
            {mantras.map((mantra, index) => (
              <div
                key={index}
                className="p-3 bg-primary/5 rounded-lg border-l-4 border-primary"
              >
                <p className="text-sm text-text-primary italic font-lexend">{mantra}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
}

// Dosha Tab Component
function DoshaTab({ report }: { report: KundliReport }) {
  const doshas = report.doshas as Record<string, unknown>;
  const mangalDosha = doshas?.mangalDosha as { hasDosha: boolean; description: string; remedies?: string[] } | undefined;
  const kaalSarpDosha = doshas?.kaalSarpDosha as { hasDosha: boolean; type: string; description: string; remedies?: string[] } | undefined;
  const sadeSati = doshas?.sadeSati as { isActive: boolean; phase: string } | undefined;

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
              mangalDosha?.hasDosha ? 'bg-red-100' : 'bg-green-100'
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 ${mangalDosha?.hasDosha ? 'text-red-600' : 'text-green-600'}`}
            />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary font-lexend">
              Mangal Dosha
            </h3>
            <p
              className={`text-sm font-medium mt-1 font-lexend ${
                mangalDosha?.hasDosha ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {mangalDosha?.hasDosha ? 'Present' : 'Not Present'}
            </p>
            <p className="text-sm text-text-secondary mt-2 font-lexend">
              {mangalDosha?.description || 'No information available.'}
            </p>
          </div>
        </div>
      </Card>

      {/* Kaal Sarp Dosha */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              kaalSarpDosha?.hasDosha ? 'bg-red-100' : 'bg-green-100'
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 ${kaalSarpDosha?.hasDosha ? 'text-red-600' : 'text-green-600'}`}
            />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary font-lexend">
              Kaal Sarp Dosha
            </h3>
            <p
              className={`text-sm font-medium mt-1 font-lexend ${
                kaalSarpDosha?.hasDosha ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {kaalSarpDosha?.hasDosha ? `Present (${kaalSarpDosha.type})` : 'Not Present'}
            </p>
            <p className="text-sm text-text-secondary mt-2 font-lexend">
              {kaalSarpDosha?.description || 'No information available.'}
            </p>
          </div>
        </div>
      </Card>

      {/* Sade Sati */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              sadeSati?.isActive ? 'bg-amber-100' : 'bg-green-100'
            }`}
          >
            <Clock
              className={`w-5 h-5 ${sadeSati?.isActive ? 'text-amber-600' : 'text-green-600'}`}
            />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary font-lexend">
              Sade Sati
            </h3>
            <p
              className={`text-sm font-medium mt-1 font-lexend ${
                sadeSati?.isActive ? 'text-amber-600' : 'text-green-600'
              }`}
            >
              {sadeSati?.isActive ? `Active (${sadeSati.phase} Phase)` : 'Not Active'}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Charts Tab Component
function ChartsTab({ report }: { report: KundliReport }) {
  const charts = report.charts as Record<string, string>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Lagna Chart */}
      {charts?.lagnaChart && (
        <Card className="p-4">
          <h3 className="text-base font-semibold text-text-primary mb-4 font-lexend">
            Lagna Chart
          </h3>
          <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center">
            <p className="text-text-muted font-lexend">Chart visualization coming soon</p>
          </div>
        </Card>
      )}

      {/* Moon Chart */}
      {charts?.moonChart && (
        <Card className="p-4">
          <h3 className="text-base font-semibold text-text-primary mb-4 font-lexend">
            Moon Chart
          </h3>
          <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center">
            <p className="text-text-muted font-lexend">Chart visualization coming soon</p>
          </div>
        </Card>
      )}

      {/* Navamsa Chart */}
      {charts?.navamsaChart && (
        <Card className="p-4">
          <h3 className="text-base font-semibold text-text-primary mb-4 font-lexend">
            Navamsa Chart
          </h3>
          <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center">
            <p className="text-text-muted font-lexend">Chart visualization coming soon</p>
          </div>
        </Card>
      )}

      {!charts?.lagnaChart && !charts?.moonChart && !charts?.navamsaChart && (
        <Card className="p-6 text-center">
          <p className="text-text-secondary font-lexend">No chart data available.</p>
        </Card>
      )}
    </motion.div>
  );
}

// Dasha Tab Component
function DashaTab({ report }: { report: KundliReport }) {
  const doshas = report.doshas as Record<string, unknown>;
  const currentDasha = doshas?.currentDasha as {
    mahadasha: { planet: string; startDate: string; endDate: string };
    antardasha: { planet: string; startDate: string; endDate: string };
  } | undefined;
  const dashaPeriods = (doshas?.dashaPeriods as Array<{
    planet: string;
    startDate: string;
    endDate: string;
    durationYears: number;
  }>) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Current Dasha */}
      {currentDasha && (
        <Card className="p-4 bg-primary/5 border-2 border-primary/20">
          <h3 className="text-base font-semibold text-text-primary mb-4 font-lexend">
            Current Dasha Period
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-text-muted font-lexend">Mahadasha</p>
              <p className="text-lg font-semibold text-primary font-lexend">
                {currentDasha.mahadasha.planet}
              </p>
              <p className="text-xs text-text-secondary font-lexend">
                {formatDate(currentDasha.mahadasha.startDate)} -{' '}
                {formatDate(currentDasha.mahadasha.endDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted font-lexend">Antardasha</p>
              <p className="text-base font-semibold text-text-primary font-lexend">
                {currentDasha.antardasha.planet}
              </p>
              <p className="text-xs text-text-secondary font-lexend">
                {formatDate(currentDasha.antardasha.startDate)} -{' '}
                {formatDate(currentDasha.antardasha.endDate)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Dasha Periods */}
      {dashaPeriods.length > 0 && (
        <Card className="p-4">
          <h3 className="text-base font-semibold text-text-primary mb-4 font-lexend">
            Mahadasha Periods
          </h3>
          <div className="space-y-3">
            {dashaPeriods.map((period, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div>
                  <p className="text-sm font-semibold text-text-primary font-lexend">
                    {period.planet}
                  </p>
                  <p className="text-xs text-text-secondary font-lexend">
                    {formatDate(period.startDate)} - {formatDate(period.endDate)}
                  </p>
                </div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded font-lexend">
                  {period.durationYears} years
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {!currentDasha && dashaPeriods.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-text-secondary font-lexend">No Dasha data available.</p>
        </Card>
      )}
    </motion.div>
  );
}

export default function KundliReportPage() {
  const params = useParams();
  const router = useRouter();
  const kundliId = params.id as string;
  const [activeTab, setActiveTab] = useState<KundliTab>('general');

  // Auth check
  const { isReady } = useRequireAuth();

  // Fetch kundli details
  const { data: kundliData, isLoading: isKundliLoading } = useQuery({
    queryKey: ['kundli', kundliId],
    queryFn: async () => {
      if (shouldUseMockData()) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { success: true, data: MOCK_KUNDLI };
      }
      return kundliService.getKundliById(kundliId);
    },
    enabled: isReady && !!kundliId,
  });

  // Fetch kundli report
  const { data: reportData, isLoading: isReportLoading } = useQuery({
    queryKey: ['kundli-report', kundliId],
    queryFn: async () => {
      if (shouldUseMockData()) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { success: true, data: MOCK_REPORT };
      }
      return kundliService.getKundliReport(kundliId);
    },
    enabled: isReady && !!kundliId,
  });

  const kundli = kundliData?.data;
  const report = reportData?.data;
  const isLoading = !isReady || isKundliLoading || isReportLoading;

  // Render tab content
  const renderTabContent = useMemo(() => {
    if (!report) return null;

    switch (activeTab) {
      case 'general':
        return <GeneralTab report={report} />;
      case 'remedies':
        return <RemediesTab report={report} />;
      case 'dosha':
        return <DoshaTab report={report} />;
      case 'charts':
        return <ChartsTab report={report} />;
      case 'dasha':
        return <DashaTab report={report} />;
      default:
        return null;
    }
  }, [activeTab, report]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-offWhite">
        <div className="bg-white sticky top-0 z-10 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-md" />
              <div>
                <Skeleton className="w-32 h-6 mb-1" />
                <Skeleton className="w-48 h-4" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="w-20 h-8 rounded-full flex-shrink-0" />
            ))}
          </div>
        </div>
        <div className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-offWhite">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/kundli-reports">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-text-primary font-lexend">
                {kundli?.name || 'Kundli Report'}
              </h1>
              {kundli && (
                <p className="text-xs text-text-secondary font-lexend">
                  {formatDate(kundli.dateOfBirth)}, {kundli.timeOfBirth} | {kundli.placeOfBirth}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors font-lexend ${
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <AnimatePresence mode="wait">{renderTabContent}</AnimatePresence>
      </div>

      {/* Bottom padding for navigation */}
      <div className="h-24" />
    </div>
  );
}
