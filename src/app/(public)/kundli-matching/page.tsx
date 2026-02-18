'use client';

/**
 * Kundli Matching Page
 * Web-standard design with HeroSection, PageContainer, and Breadcrumbs
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { HeroSection } from '@/components/layout/HeroSection';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useGenerateMatching } from '@/hooks/useKundli';
import { useUIStore } from '@/stores/ui-store';
import {
  Heart,
  User,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  CheckCircle,
  Sparkles,
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
];

// What we analyze
const ANALYSIS_FEATURES = [
  'Ashtakoot Gun Milan (36 points)',
  'Mangal Dosha compatibility',
  'Nadi Dosha analysis',
  'Overall compatibility score',
  'Marriage recommendations',
];

interface PersonData {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  birthPlace: {
    name: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
}

const initialPersonData: PersonData = {
  name: '',
  dateOfBirth: '',
  timeOfBirth: '',
  birthPlace: {
    name: '',
    latitude: 0,
    longitude: 0,
    timezone: 'Asia/Kolkata',
  },
};

export default function KundliMatchingPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [boyData, setBoyData] = useState<PersonData>(initialPersonData);
  const [girlData, setGirlData] = useState<PersonData>(initialPersonData);
  const { addToast } = useUIStore();
  const generateMatching = useGenerateMatching();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const matchingInput = {
      boyDetails: {
        name: boyData.name,
        dateOfBirth: boyData.dateOfBirth,
        timeOfBirth: boyData.timeOfBirth,
        placeOfBirth: boyData.birthPlace.name,
        latitude: boyData.birthPlace.latitude,
        longitude: boyData.birthPlace.longitude,
        timezone: boyData.birthPlace.timezone,
      },
      girlDetails: {
        name: girlData.name,
        dateOfBirth: girlData.dateOfBirth,
        timeOfBirth: girlData.timeOfBirth,
        placeOfBirth: girlData.birthPlace.name,
        latitude: girlData.birthPlace.latitude,
        longitude: girlData.birthPlace.longitude,
        timezone: girlData.birthPlace.timezone,
      },
    };

    generateMatching.mutate(matchingInput, {
      onSuccess: (response) => {
        const matchingId = response?.data?.id || `match-${Date.now()}`;
        router.push(`/kundli-matching/${matchingId}`);
      },
      onError: () => {
        // Fallback: generate a local ID and navigate to result page
        // The result page has built-in fallback mock data
        const fallbackId = `match-${Date.now()}`;
        addToast({
          type: 'info',
          title: 'Demo Mode',
          message: 'Showing sample matching results. Connect API for actual analysis.',
        });
        router.push(`/kundli-matching/${fallbackId}`);
      },
    });
  };

  const isPersonDataValid = (data: PersonData) => {
    return (
      data.name.trim().length >= 2 &&
      data.dateOfBirth !== '' &&
      data.timeOfBirth !== '' &&
      data.birthPlace.name !== ''
    );
  };

  const isFormValid = () => {
    return isPersonDataValid(boyData) && isPersonDataValid(girlData);
  };

  const selectCity = (person: 'boy' | 'girl', city: typeof POPULAR_CITIES[0]) => {
    const setData = person === 'boy' ? setBoyData : setGirlData;
    const data = person === 'boy' ? boyData : girlData;
    setData({
      ...data,
      birthPlace: {
        name: city.name,
        latitude: city.lat,
        longitude: city.lng,
        timezone: city.timezone,
      },
    });
  };

  // Landing page
  if (!showForm) {
    return (
      <div className="min-h-screen bg-background-offWhite">
        {/* Hero Section */}
        <HeroSection
          variant="gradient"
          size="md"
          title="Kundli Matching"
          subtitle="Check compatibility between two people for marriage with Ashtakoot Gun Milan"
        >
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setShowForm(true)}
            className="px-8 shadow-lg"
          >
            Start Matching
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </HeroSection>

        {/* Content */}
        <PageContainer size="lg" className="py-10 lg:py-14">
          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* What We Analyze */}
            <Card className="p-6 bg-white">
              <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2 font-lexend">
                <CheckCircle className="w-5 h-5 text-pink-500" />
                What We Analyze
              </h2>
              <ul className="space-y-3">
                {ANALYSIS_FEATURES.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-pink-600">{idx + 1}</span>
                    </div>
                    <span className="text-sm text-text-secondary font-nunito">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Score Scale */}
            <Card className="p-6 bg-white">
              <h3 className="font-semibold text-text-primary mb-4 text-center font-lexend">
                Matching Score Scale
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-700">Excellent Match</span>
                  <span className="text-sm text-green-600">25-36 points</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-700">Good Match</span>
                  <span className="text-sm text-blue-600">18-24 points</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium text-yellow-700">Average Match</span>
                  <span className="text-sm text-yellow-600">12-17 points</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-red-700">Below Average</span>
                  <span className="text-sm text-red-600">0-11 points</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Expert CTA */}
          <div className="max-w-5xl mx-auto mt-8">
            <Card className="p-6 text-center bg-gradient-to-r from-pink-50 to-primary/5 border-0">
              <h3 className="font-semibold text-text-primary mb-2 font-lexend">
                Need Expert Guidance?
              </h3>
              <p className="text-sm text-text-secondary mb-4 font-nunito">
                Consult our expert astrologers for detailed compatibility analysis
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
        variant="gradient"
        size="sm"
        title="Kundli Matching"
        subtitle="Enter birth details for both boy and girl"
      />

      {/* Form Container */}
      <PageContainer size="lg" className="py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Kundli Matching', href: '/kundli-matching' },
            { label: 'Match Details' },
          ]}
        />

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-6 mt-4 max-w-5xl mx-auto"
        >
          {/* Side by Side Cards on Desktop */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Boy's Details Card */}
            <Card className="p-6 border-t-4 border-t-primary">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-text-primary text-lg font-lexend">Boy&apos;s Details</h2>
                  <p className="text-xs text-text-secondary font-nunito">Groom&apos;s birth information</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter boy's full name"
                    value={boyData.name}
                    onChange={(e) => setBoyData({ ...boyData, name: e.target.value })}
                  />
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                      <Calendar className="w-3.5 h-3.5 inline mr-1" />
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={boyData.dateOfBirth}
                      onChange={(e) => setBoyData({ ...boyData, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                      <Clock className="w-3.5 h-3.5 inline mr-1" />
                      Time of Birth <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="time"
                      value={boyData.timeOfBirth}
                      onChange={(e) => setBoyData({ ...boyData, timeOfBirth: e.target.value })}
                    />
                  </div>
                </div>

                {/* Birth Place */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    <MapPin className="w-3.5 h-3.5 inline mr-1" />
                    Birth Place <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Search city..."
                    value={boyData.birthPlace.name}
                    onChange={(e) =>
                      setBoyData({
                        ...boyData,
                        birthPlace: { ...boyData.birthPlace, name: e.target.value },
                      })
                    }
                  />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {POPULAR_CITIES.slice(0, 4).map((city) => (
                      <button
                        key={city.name}
                        type="button"
                        onClick={() => selectCity('boy', city)}
                        className={`px-3 py-1 rounded-full border text-xs transition-all ${
                          boyData.birthPlace.name === city.name
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-200 text-text-secondary hover:border-primary/50'
                        }`}
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Validation indicator */}
              <div className={`mt-4 p-2 rounded-lg text-xs flex items-center gap-2 ${
                isPersonDataValid(boyData)
                  ? 'bg-green-50 text-green-600'
                  : 'bg-gray-50 text-text-muted'
              }`}>
                <CheckCircle className={`w-4 h-4 ${isPersonDataValid(boyData) ? 'text-green-500' : 'text-gray-300'}`} />
                {isPersonDataValid(boyData) ? 'All details filled' : 'Please fill all required fields'}
              </div>
            </Card>

            {/* Girl's Details Card */}
            <Card className="p-6 border-t-4 border-t-pink-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-text-primary text-lg font-lexend">Girl&apos;s Details</h2>
                  <p className="text-xs text-text-secondary font-nunito">Bride&apos;s birth information</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter girl's full name"
                    value={girlData.name}
                    onChange={(e) => setGirlData({ ...girlData, name: e.target.value })}
                  />
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                      <Calendar className="w-3.5 h-3.5 inline mr-1" />
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={girlData.dateOfBirth}
                      onChange={(e) => setGirlData({ ...girlData, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                      <Clock className="w-3.5 h-3.5 inline mr-1" />
                      Time of Birth <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="time"
                      value={girlData.timeOfBirth}
                      onChange={(e) => setGirlData({ ...girlData, timeOfBirth: e.target.value })}
                    />
                  </div>
                </div>

                {/* Birth Place */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    <MapPin className="w-3.5 h-3.5 inline mr-1" />
                    Birth Place <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Search city..."
                    value={girlData.birthPlace.name}
                    onChange={(e) =>
                      setGirlData({
                        ...girlData,
                        birthPlace: { ...girlData.birthPlace, name: e.target.value },
                      })
                    }
                  />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {POPULAR_CITIES.slice(0, 4).map((city) => (
                      <button
                        key={city.name}
                        type="button"
                        onClick={() => selectCity('girl', city)}
                        className={`px-3 py-1 rounded-full border text-xs transition-all ${
                          girlData.birthPlace.name === city.name
                            ? 'border-pink-500 bg-pink-500 text-white'
                            : 'border-gray-200 text-text-secondary hover:border-pink-300'
                        }`}
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Validation indicator */}
              <div className={`mt-4 p-2 rounded-lg text-xs flex items-center gap-2 ${
                isPersonDataValid(girlData)
                  ? 'bg-green-50 text-green-600'
                  : 'bg-gray-50 text-text-muted'
              }`}>
                <CheckCircle className={`w-4 h-4 ${isPersonDataValid(girlData) ? 'text-green-500' : 'text-gray-300'}`} />
                {isPersonDataValid(girlData) ? 'All details filled' : 'Please fill all required fields'}
              </div>
            </Card>
          </div>

          {/* Submit Section */}
          <Card className="p-6 bg-gradient-to-r from-pink-50 to-primary/5">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-text-primary font-lexend">Ready to Check Compatibility?</h3>
                <p className="text-sm text-text-secondary font-nunito">
                  Get detailed Ashtakoot Gun Milan analysis with dosha compatibility
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!isFormValid() || generateMatching.isPending}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  {generateMatching.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Check Compatibility
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Note */}
          <p className="text-xs text-text-muted text-center">
            For accurate matching results, please enter exact birth details as per birth certificates
          </p>
        </motion.form>
      </PageContainer>
    </div>
  );
}
