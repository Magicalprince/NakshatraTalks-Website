'use client';

/**
 * Kundli Page
 * Web-standard design with HeroSection, PageContainer, and Breadcrumbs.
 * - Landing page shows features + previously generated reports.
 * - Form submits via the API and navigates to the result page.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { HeroSection } from '@/components/layout/HeroSection';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useGenerateKundli, useKundliList, useMatchingList } from '@/hooks/useKundli';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { placesService, Place } from '@/lib/services/places.service';
import { Kundli, SavedMatching } from '@/types/api.types';
import {
  FileText,
  User,
  Calendar,
  MapPin,
  ChevronRight,
  Star,
  Sparkles,
  TrendingUp,
  Heart,
  HeartHandshake,
  Shield,
  Check,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

// Popular cities for quick selection
const POPULAR_CITIES = [
  { name: 'Mumbai', lat: 19.076, lng: 72.8777, timezone: 'Asia/Kolkata' },
  { name: 'Delhi', lat: 28.6139, lng: 77.209, timezone: 'Asia/Kolkata' },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946, timezone: 'Asia/Kolkata' },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, timezone: 'Asia/Kolkata' },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, timezone: 'Asia/Kolkata' },
  { name: 'Hyderabad', lat: 17.385, lng: 78.4867, timezone: 'Asia/Kolkata' },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, timezone: 'Asia/Kolkata' },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, timezone: 'Asia/Kolkata' },
];

// Features included in Kundli
const FEATURES = [
  { icon: Star, title: 'Birth Chart', desc: 'Rasi & Navamsa charts', color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { icon: TrendingUp, title: 'Dasha Periods', desc: 'Planetary time periods', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: Shield, title: 'Dosha Analysis', desc: 'Mangal & Kaal Sarp', color: 'text-red-500', bg: 'bg-red-50' },
  { icon: Sparkles, title: 'Remedies', desc: 'Gemstones & Mantras', color: 'text-purple-500', bg: 'bg-purple-50' },
];

// Format date for display
const formatDate = (dateString: string, timeString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}, ${timeString}`;
};

// Get initials from name
const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export default function KundliPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const { mutate: generateKundli, isPending } = useGenerateKundli();
  const { data: kundliList, isLoading: isKundliListLoading } = useKundliList();
  const { data: matchingList, isLoading: isMatchingListLoading } = useMatchingList();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    dateOfBirth: '',
    timeOfBirth: '',
    birthPlace: {
      name: '',
      latitude: 0,
      longitude: 0,
      timezone: 'Asia/Kolkata',
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const kundliInput = {
      name: formData.name,
      gender: formData.gender as 'male' | 'female' | 'other',
      dateOfBirth: formData.dateOfBirth,
      timeOfBirth: formData.timeOfBirth,
      birthPlace: {
        name: formData.birthPlace.name,
        latitude: formData.birthPlace.latitude,
        longitude: formData.birthPlace.longitude,
        timezone: formData.birthPlace.timezone,
      },
    };

    generateKundli(kundliInput, {
      onSuccess: (response) => {
        const newId = response?.data?.id;
        if (newId) {
          addToast({
            type: 'success',
            title: 'Kundli Generated',
            message: 'Your kundli has been generated successfully.',
          });
          router.push(`/kundli-reports/${newId}`);
        } else {
          // Fallback — API returned success but no ID
          addToast({
            type: 'success',
            title: 'Kundli Generated',
            message: 'Your kundli has been generated. Redirecting to reports...',
          });
          router.push('/kundli-reports');
        }
      },
      onError: (error) => {
        addToast({
          type: 'error',
          title: 'Generation Failed',
          message: error instanceof Error ? error.message : 'Failed to generate kundli. Please try again.',
        });
      },
    });
  };

  // Place search state
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState<Place[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [showPlaceDropdown, setShowPlaceDropdown] = useState(false);
  const placeSearchTimeout = useRef<NodeJS.Timeout | null>(null);
  const placeDropdownRef = useRef<HTMLDivElement>(null);

  // Debounced place search
  const searchPlaces = useCallback((query: string) => {
    if (placeSearchTimeout.current) clearTimeout(placeSearchTimeout.current);
    if (query.trim().length < 2) {
      setPlaceResults([]);
      setShowPlaceDropdown(false);
      return;
    }
    placeSearchTimeout.current = setTimeout(async () => {
      setIsSearchingPlaces(true);
      try {
        const response = await placesService.searchPlaces(query);
        const places = response.data || [];
        setPlaceResults(places);
        setShowPlaceDropdown(places.length > 0);
      } catch {
        setPlaceResults([]);
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 300);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (placeDropdownRef.current && !placeDropdownRef.current.contains(e.target as Node)) {
        setShowPlaceDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectPlace = (place: Place) => {
    setFormData({
      ...formData,
      birthPlace: {
        name: place.fullName || place.name,
        latitude: place.latitude,
        longitude: place.longitude,
        timezone: place.timezone,
      },
    });
    setPlaceQuery(place.fullName || place.name);
    setShowPlaceDropdown(false);
  };

  const isFormValid = () => {
    return (
      formData.name.trim().length >= 2 &&
      formData.gender !== '' &&
      formData.dateOfBirth !== '' &&
      formData.timeOfBirth !== '' &&
      formData.birthPlace.name !== '' &&
      formData.birthPlace.latitude !== 0
    );
  };

  const selectCity = (city: typeof POPULAR_CITIES[0]) => {
    setFormData({
      ...formData,
      birthPlace: {
        name: city.name,
        latitude: city.lat,
        longitude: city.lng,
        timezone: city.timezone,
      },
    });
    setPlaceQuery(city.name);
  };

  const previousReports: Kundli[] = kundliList || [];
  const previousMatchings: SavedMatching[] = matchingList || [];

  // Landing page
  if (!showForm) {
    return (
      <div className="min-h-screen bg-background-offWhite">
        {/* Hero Section */}
        <HeroSection
          variant="primary"
          size="md"
          title="Free Kundli"
          subtitle="Generate your detailed Vedic birth chart with planetary positions, doshas, and life predictions"
        >
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setShowForm(true)}
            className="px-8 shadow-lg"
          >
            Generate Your Kundli
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </HeroSection>

        {/* Features Grid */}
        <PageContainer size="lg" className="py-10 lg:py-14">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-semibold text-text-primary text-center text-xl mb-6 font-lexend">
              What&apos;s Included
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className={`${feature.bg} rounded-xl p-5 text-center`}
                >
                  <feature.icon className={`w-8 h-8 ${feature.color} mx-auto mb-2`} />
                  <h3 className="font-medium text-text-primary text-sm font-lexend">{feature.title}</h3>
                  <p className="text-xs text-text-secondary mt-1 font-nunito">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Previously Generated Reports */}
          {isAuthenticated && (
            <div className="max-w-4xl mx-auto mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-text-primary text-lg font-lexend">
                  Your Kundli Reports
                </h2>
                {previousReports.length > 0 && (
                  <Link
                    href="/kundli-reports"
                    className="text-sm text-primary hover:text-primary-dark font-medium font-lexend flex items-center gap-1 transition-colors"
                  >
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {isKundliListLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-11 h-11 rounded-full" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : previousReports.length === 0 ? (
                <Card className="p-6 text-center">
                  <FileText className="w-10 h-10 text-text-muted/40 mx-auto mb-2" />
                  <p className="text-sm text-text-secondary font-nunito">
                    No reports yet. Generate your first Kundli to see it here.
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {previousReports.slice(0, 5).map((kundli, index) => (
                    <motion.div
                      key={kundli.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <Link href={`/kundli-reports/${kundli.id}`}>
                        <Card className="p-4 hover:shadow-web-sm hover:border-primary/10 transition-all cursor-pointer group">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-semibold text-sm font-lexend">
                                {getInitials(kundli.name)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-text-primary truncate font-lexend group-hover:text-primary transition-colors">
                                {kundli.name}
                              </p>
                              <p className="text-xs text-text-secondary truncate font-nunito">
                                {formatDate(kundli.dateOfBirth, kundli.timeOfBirth)} &middot; {kundli.birthPlace?.name || kundli.placeOfBirth || ''}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-text-muted flex-shrink-0 group-hover:text-primary transition-colors" />
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Previously Generated Matching Reports */}
          {isAuthenticated && (
            <div className="max-w-4xl mx-auto mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-text-primary text-lg font-lexend">
                  Your Matching Reports
                </h2>
                {previousMatchings.length > 0 && (
                  <Link
                    href="/saved-matchings"
                    className="text-sm text-pink-500 hover:text-pink-600 font-medium font-lexend flex items-center gap-1 transition-colors"
                  >
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {isMatchingListLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-11 h-11 rounded-full" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="w-12 h-6 rounded-full" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : previousMatchings.length === 0 ? (
                <Card className="p-6 text-center">
                  <HeartHandshake className="w-10 h-10 text-text-muted/40 mx-auto mb-2" />
                  <p className="text-sm text-text-secondary font-nunito">
                    No matching reports yet. Try Kundli Matching to check compatibility.
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {previousMatchings.slice(0, 5).map((matching, index) => {
                    const s = matching.score || 0;
                    const m = matching.maxScore || 36;
                    const pct = Math.round((s / m) * 100);
                    const scoreColor =
                      s >= 25
                        ? 'text-green-600 bg-green-50'
                        : s >= 18
                          ? 'text-blue-600 bg-blue-50'
                          : s >= 12
                            ? 'text-yellow-600 bg-yellow-50'
                            : 'text-red-600 bg-red-50';

                    return (
                      <motion.div
                        key={matching.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                      >
                        <Link href={`/kundli-matching/${matching.id}`}>
                          <Card className="p-4 hover:shadow-web-sm hover:border-pink-500/10 transition-all cursor-pointer group">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                                <HeartHandshake className="w-5 h-5 text-pink-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-text-primary truncate font-lexend group-hover:text-pink-500 transition-colors">
                                  {matching.boy?.name || 'Boy'} & {matching.girl?.name || 'Girl'}
                                </p>
                                <p className="text-xs text-text-secondary font-nunito">
                                  {s}/{m} points &middot; {pct}% compatible
                                </p>
                              </div>
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${scoreColor}`}>
                                {s}/{m}
                              </span>
                            </div>
                          </Card>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Kundli Matching Link */}
          <div className="max-w-4xl mx-auto mt-8">
            <Link href="/kundli-matching">
              <Card className="p-5 hover:shadow-lg transition-shadow cursor-pointer flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-pink-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary font-lexend">Kundli Matching</h3>
                  <p className="text-sm text-text-secondary font-nunito">
                    Check compatibility for marriage with Gun Milan
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-text-muted" />
              </Card>
            </Link>
          </div>

          {/* Expert CTA */}
          <div className="max-w-4xl mx-auto mt-8">
            <Card className="p-6 text-center bg-gradient-to-r from-primary/5 to-secondary/10 border-0">
              <h3 className="font-semibold text-text-primary mb-2 font-lexend">
                Need Expert Analysis?
              </h3>
              <p className="text-sm text-text-secondary mb-4 font-nunito">
                Get your Kundli analyzed by our expert Vedic astrologers
              </p>
              <Link href="/browse-chat">
                <Button variant="primary" size="sm">
                  Consult an Astrologer
                </Button>
              </Link>
            </Card>
          </div>
        </PageContainer>
      </div>
    );
  }

  // Form page - Web-standard layout with Breadcrumbs
  return (
    <div className="min-h-screen bg-background-offWhite">
      {/* Hero Section */}
      <HeroSection
        variant="primary"
        size="sm"
        title="Generate Your Kundli"
        subtitle="Enter your birth details for accurate predictions"
      />

      {/* Form Container */}
      <PageContainer size="md" className="py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Kundli', href: '/kundli' },
            { label: 'Generate' },
          ]}
        />

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-6 mt-4"
        >
          {/* Personal Details Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-text-primary font-lexend">Personal Details</h2>
                <p className="text-xs text-text-secondary font-nunito">Enter your basic information</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter your full name as per birth records"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Gender */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  {(['male', 'female', 'other'] as const).map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender })}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                        formData.gender === gender
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 text-text-secondary hover:border-primary/50'
                      }`}
                    >
                      {formData.gender === gender && <Check className="w-4 h-4" />}
                      <span className="capitalize font-medium">{gender}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Birth Details Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-text-primary font-lexend">Birth Details</h2>
                <p className="text-xs text-text-secondary font-nunito">Provide accurate birth information for precise calculations</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Time of Birth */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Time of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="time"
                    value={formData.timeOfBirth}
                    onChange={(e) => setFormData({ ...formData, timeOfBirth: e.target.value })}
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-text-muted mt-1.5">
                  Check your birth certificate for accurate time
                </p>
              </div>
            </div>
          </Card>

          {/* Birth Place Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="font-semibold text-text-primary font-lexend">Birth Place</h2>
                <p className="text-xs text-text-secondary font-nunito">Select or search your birth city</p>
              </div>
            </div>

            {/* Search Input with Autocomplete */}
            <div className="mb-4 relative" ref={placeDropdownRef}>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                City/Town <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for your birth city..."
                  value={placeQuery}
                  onChange={(e) => {
                    setPlaceQuery(e.target.value);
                    searchPlaces(e.target.value);
                    // Clear lat/lng when user types manually
                    if (formData.birthPlace.latitude !== 0) {
                      setFormData({
                        ...formData,
                        birthPlace: { name: e.target.value, latitude: 0, longitude: 0, timezone: 'Asia/Kolkata' },
                      });
                    }
                  }}
                  onFocus={() => { if (placeResults.length > 0) setShowPlaceDropdown(true); }}
                />
                {isSearchingPlaces && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted animate-spin" />
                )}
              </div>
              {formData.birthPlace.latitude !== 0 && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {formData.birthPlace.name} ({formData.birthPlace.latitude.toFixed(2)}°, {formData.birthPlace.longitude.toFixed(2)}°)
                </p>
              )}
              {/* Autocomplete dropdown */}
              {showPlaceDropdown && placeResults.length > 0 && (
                <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-web-md max-h-48 overflow-y-auto">
                  {placeResults.map((place, idx) => (
                    <button
                      key={`${place.name}-${idx}`}
                      type="button"
                      onClick={() => selectPlace(place)}
                      className="w-full text-left px-4 py-2.5 hover:bg-primary/5 transition-colors flex items-center gap-2 border-b border-gray-50 last:border-0"
                    >
                      <MapPin className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-text-primary font-nunito truncate">{place.fullName || place.name}</p>
                        {place.state && (
                          <p className="text-xs text-text-muted">{place.state}{place.country ? `, ${place.country}` : ''}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Cities */}
            <div>
              <p className="text-sm text-text-secondary mb-3">Popular Cities</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_CITIES.map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => selectCity(city)}
                    className={`px-4 py-2 rounded-full border text-sm transition-all ${
                      formData.birthPlace.name === city.name
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 text-text-secondary hover:border-primary/50 hover:bg-gray-50'
                    }`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setShowForm(false)}
              className="sm:flex-1"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!isFormValid() || isPending}
              className="sm:flex-[2]"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Kundli
                </>
              )}
            </Button>
          </div>

          {/* Note */}
          <p className="text-xs text-text-muted text-center">
            Your data is secure and will only be used for generating your Kundli report
          </p>
        </motion.form>

        {/* Full-screen loading overlay while generating */}
        {isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
          >
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary font-lexend mb-2">
                Generating Your Kundli
              </h3>
              <p className="text-sm text-text-secondary font-lexend text-center max-w-xs">
                Calculating planetary positions and preparing your birth chart report...
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
      </PageContainer>
    </div>
  );
}
