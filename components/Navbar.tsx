'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '@/utils/cn';

// Lazy load NotificationBell to prevent SSR issues
const NotificationBell = React.lazy(() => import('./NotificationBell').then(m => ({ default: m.NotificationBell })));

interface NavbarProps {
  user?: {
    id: string;
    fullName: string;
    role: 'farmer' | 'vet' | 'admin';
  } | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/vet-directory', label: 'Find a Vet' },
    { href: '/learning-hub', label: 'Learning Hub' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-white shadow-soft sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">VetLink</span>
            <span className="text-sm text-secondary">Sierra Leone</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'text-primary'
                    : 'text-gray-600 hover:text-primary'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <React.Suspense fallback={null}>
                  <NotificationBell />
                </React.Suspense>
                <Link
                  href={
                    user.role === 'farmer'
                      ? '/farmer/dashboard'
                      : user.role === 'vet'
                      ? '/vet/dashboard'
                      : '/admin/dashboard'
                  }
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary"
                >
                  <User className="w-4 h-4" />
                  {user.fullName}
                </Link>
                {onLogout && (
                  <Button variant="ghost" size="sm" onClick={onLogout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                )}
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block text-sm font-medium',
                  isActive(link.href) ? 'text-primary' : 'text-gray-600'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href={
                    user.role === 'farmer'
                      ? '/farmer/dashboard'
                      : user.role === 'vet'
                      ? '/vet/dashboard'
                      : '/admin/dashboard'
                  }
                  className="block text-sm font-medium text-gray-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {onLogout && (
                  <Button variant="ghost" size="sm" onClick={onLogout} className="w-full">
                    Logout
                  </Button>
                )}
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

