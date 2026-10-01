import { Sprout, HeartPulse, Hotel, GraduationCap } from 'lucide-react';

export const PROJECT_CATEGORIES = [
  {
    id: 'Agriculture',
    name: 'Agriculture',
    description: 'Projects related to farming, livestock, food production, and agricultural businesses.',
    icon: Sprout,
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    accentColor: 'text-emerald-600',
    gradient: 'from-emerald-600 to-green-700',
  },
  {
    id: 'Healthcare',
    name: 'Healthcare',
    description: 'Projects related to healthcare services, clinics, medical solutions, and health-related businesses.',
    icon: HeartPulse,
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
    accentColor: 'text-rose-600',
    gradient: 'from-rose-600 to-red-700',
  },
  {
    id: 'Hospitality & Tourism',
    name: 'Hospitality & Tourism',
    description: 'Projects related to hotels, restaurants, tourism services, travel, and hospitality businesses.',
    icon: Hotel,
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    accentColor: 'text-amber-600',
    gradient: 'from-amber-600 to-orange-700',
  },
  {
    id: 'Education',
    name: 'Education',
    description: 'Projects related to schools, training centers, online learning, educational services, and learning platforms.',
    icon: GraduationCap,
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    accentColor: 'text-blue-600',
    gradient: 'from-blue-600 to-indigo-700',
  },
];
