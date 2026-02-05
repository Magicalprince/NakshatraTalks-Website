'use client';

/**
 * Kundli Page
 * Web-optimized design with single-page form layout
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
  Shield,
  Check,
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

export default function KundliPage() {
  const router = useRouter();
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
    // In production, this would call the API
    console.log('Generating Kundli with:', formData);
    // Navigate to a report page or show results
    router.push('/kundli-reports');
  };

  const isFormValid = () => {
    return (
      formData.name.trim().length >= 2 &&
      formData.gender !== '' &&
      formData.dateOfBirth !== '' &&
      formData.timeOfBirth !== '' &&
      formData.birthPlace.name !== ''
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
  };

  // Landing page
  if (!showForm) {
    return (
      <div className="min-h-screen bg-background-offWhite">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-primary via-primary to-primary/95 text-white pt-8 pb-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            {/* Kundli Icon/Image */}
            <div className="w-24 h-24 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-secondary/30 rounded-full blur-xl" />
              <div className="relative w-full h-full bg-white/10 rounded-full flex items-center justify-center border-2 border-white/20">
                <FileText className="w-12 h-12 text-secondary" />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Free Kundli
            </h1>
            <p className="text-white/80 text-base max-w-md mx-auto mb-8">
              Generate your detailed Vedic birth chart with planetary positions,
              doshas, and life predictions
            </p>

            {/* Generate Button */}
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setShowForm(true)}
              className="px-8 shadow-lg"
            >
              Generate Your Kundli
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-4 max-w-2xl -mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="font-semibold text-text-primary text-center mb-4">
              What&apos;s Included
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className={`${feature.bg} rounded-xl p-4 text-center`}
                >
                  <feature.icon className={`w-8 h-8 ${feature.color} mx-auto mb-2`} />
                  <h3 className="font-medium text-text-primary text-sm">{feature.title}</h3>
                  <p className="text-xs text-text-secondary mt-1">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kundli Matching Link */}
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Link href="/kundli-matching">
            <Card className="p-5 hover:shadow-lg transition-shadow cursor-pointer flex items-center gap-4">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6 text-pink-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary">Kundli Matching</h3>
                <p className="text-sm text-text-secondary">
                  Check compatibility for marriage with Gun Milan
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted" />
            </Card>
          </Link>
        </div>

        {/* Expert CTA */}
        <div className="container mx-auto px-4 pb-8 max-w-2xl">
          <Card className="p-6 text-center bg-gradient-to-r from-primary/5 to-secondary/10 border-0">
            <h3 className="font-semibold text-text-primary mb-2">
              Need Expert Analysis?
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              Get your Kundli analyzed by our expert Vedic astrologers
            </p>
            <Link href="/browse-chat">
              <Button variant="primary" size="sm">
                Consult an Astrologer
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  // Form page - Web-optimized single page layout
  return (
    <div className="min-h-screen bg-background-offWhite">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/90 text-white py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <button
            onClick={() => setShowForm(false)}
            className="text-white/80 hover:text-white text-sm mb-4 flex items-center gap-1"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Kundli
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
              <FileText className="w-7 h-7 text-secondary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Generate Your Kundli</h1>
              <p className="text-white/70 text-sm">Enter your birth details for accurate predictions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Personal Details Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-text-primary">Personal Details</h2>
                <p className="text-xs text-text-secondary">Enter your basic information</p>
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
                <h2 className="font-semibold text-text-primary">Birth Details</h2>
                <p className="text-xs text-text-secondary">Provide accurate birth information for precise calculations</p>
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
                <h2 className="font-semibold text-text-primary">Birth Place</h2>
                <p className="text-xs text-text-secondary">Select or search your birth city</p>
              </div>
            </div>

            {/* Search Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                City/Town <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Search for your birth city..."
                value={formData.birthPlace.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    birthPlace: { ...formData.birthPlace, name: e.target.value },
                  })
                }
              />
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
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!isFormValid()}
              className="sm:flex-[2]"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Kundli
            </Button>
          </div>

          {/* Note */}
          <p className="text-xs text-text-muted text-center">
            Your data is secure and will only be used for generating your Kundli report
          </p>
        </motion.form>
      </div>
    </div>
  );
}
