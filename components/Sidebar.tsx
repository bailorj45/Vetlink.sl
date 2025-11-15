'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Heart,
  BookOpen,
  AlertCircle,
  Settings,
  Stethoscope,
  Calculator,
  FileText,
  Bell,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { UserRole } from '@/lib/types';

interface SidebarProps {
  role: UserRole;
}

const farmerMenuItems = [
  { href: '/farmer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/farmer/livestock', label: 'My Livestock', icon: Heart },
  { href: '/farmer/appointments', label: 'Appointments', icon: Calendar },
  { href: '/farmer/ai-symptom-checker', label: 'Symptom Checker', icon: Stethoscope },
  { href: '/farmer/feed-calculator', label: 'Feed Calculator', icon: Calculator },
  { href: '/farmer/breeding', label: 'Breeding Tracker', icon: FileText },
  { href: '/farmer/notifications', label: 'Notifications', icon: Bell },
  { href: '/farmer/settings', label: 'Settings', icon: Settings },
];

const vetMenuItems = [
  { href: '/vet/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vet/appointments', label: 'Appointments', icon: Calendar },
  { href: '/vet/requests', label: 'Requests', icon: Bell },
  { href: '/vet/profile', label: 'Profile', icon: Users },
  { href: '/vet/notifications', label: 'Notifications', icon: Bell },
  { href: '/vet/settings', label: 'Settings', icon: Settings },
];

const adminMenuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/verifications', label: 'Vet Verifications', icon: Users },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/alerts', label: 'Disease Alerts', icon: AlertCircle },
  { href: '/admin/analytics', label: 'Analytics', icon: LayoutDashboard },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const pathname = usePathname();

  const menuItems =
    role === 'farmer'
      ? farmerMenuItems
      : role === 'vet'
      ? vetMenuItems
      : adminMenuItems;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-12 transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

