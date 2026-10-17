import { Sprout, Briefcase, Hotel, GraduationCap } from 'lucide-react';

export const PROJECT_CATEGORIES = [
  {
    id: 'Agriculture',
    name: 'Agriculture',
    description: 'Projects related to farming, livestock, food production, and agricultural businesses.',
    icon: Sprout,
    badgeBg: 'bg-primary/10 text-primary border-primary/20',
    accentColor: 'text-primary',
    gradient: 'from-[#8A5F41] to-[#A77F60]',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'Business',
    name: 'Business',
    description: 'Projects related to commerce, retail, financial services, enterprise, and corporate ventures.',
    icon: Briefcase,
    badgeBg: 'bg-primary/10 text-primary border-primary/20',
    accentColor: 'text-primary',
    gradient: 'from-[#8A5F41] to-[#A77F60]',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'Hospitality & Tourism',
    name: 'Hospitality & Tourism',
    description: 'Projects related to hotels, restaurants, tourism services, travel, and hospitality businesses.',
    icon: Hotel,
    badgeBg: 'bg-primary/10 text-primary border-primary/20',
    accentColor: 'text-primary',
    gradient: 'from-[#8A5F41] to-[#A77F60]',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'Education',
    name: 'Education',
    description: 'Projects related to schools, training centers, online learning, educational services, and learning platforms.',
    icon: GraduationCap,
    badgeBg: 'bg-primary/10 text-primary border-primary/20',
    accentColor: 'text-primary',
    gradient: 'from-[#8A5F41] to-[#A77F60]',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
  },
];
