'use client';

import { Card } from '@/components/ui/Card';
import { User, Mail, Phone, Calendar, MapPin, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface PersonalDetailsProps {
  name?: string | null;
  email?: string | null;
  phone: string;
  dateOfBirth?: string | null;
  placeOfBirth?: string | null;
  timeOfBirth?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | null;
}

export function PersonalDetails({
  name,
  email,
  phone,
  dateOfBirth,
  placeOfBirth,
  timeOfBirth,
  gender,
  maritalStatus,
}: PersonalDetailsProps) {
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatGender = (g: string | null | undefined) => {
    if (!g) return null;
    return g.charAt(0).toUpperCase() + g.slice(1);
  };

  const formatMaritalStatus = (status: string | null | undefined) => {
    if (!status) return null;
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const details = [
    { icon: User, label: 'Name', value: name },
    { icon: Phone, label: 'Phone', value: phone },
    { icon: Mail, label: 'Email', value: email },
    { icon: Calendar, label: 'Date of Birth', value: formatDate(dateOfBirth) },
    { icon: MapPin, label: 'Place of Birth', value: placeOfBirth },
    { icon: Calendar, label: 'Time of Birth', value: timeOfBirth },
    { icon: User, label: 'Gender', value: formatGender(gender) },
    { icon: Heart, label: 'Marital Status', value: formatMaritalStatus(maritalStatus) },
  ].filter(item => item.value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Personal Details
        </h3>
        <div className="space-y-4">
          {details.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-muted">{item.label}</p>
                <p className="text-sm font-medium text-text-primary">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
