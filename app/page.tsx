import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Stethoscope,
  Users,
  BookOpen,
  AlertCircle,
  Calculator,
  Heart,
  Shield,
  Phone,
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Stethoscope,
      title: 'Find Certified Vets',
      description: 'Connect with verified veterinarians in your district',
    },
    {
      icon: Heart,
      title: 'Livestock Health',
      description: 'Track medical records and health history',
    },
    {
      icon: Calculator,
      title: 'AI Feed Calculator',
      description: 'Get personalized feeding recommendations',
    },
    {
      icon: BookOpen,
      title: 'Learning Hub',
      description: 'Access educational resources and audio lessons',
    },
    {
      icon: AlertCircle,
      title: 'Disease Alerts',
      description: 'Stay informed about outbreaks in your area',
    },
    {
      icon: Phone,
      title: 'Emergency SOS',
      description: 'Quick access to emergency veterinary services',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              VetLink Sierra Leone
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-cream">
              Connecting Farmers with Certified Veterinarians
            </p>
            <p className="text-lg mb-12 max-w-2xl mx-auto text-cream">
              Your digital platform for livestock health management, veterinary
              services, and agricultural education.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button variant="accent" size="lg">
                  Get Started
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="bg-white/10 border-white text-white hover:bg-white/20">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools and services for modern livestock management
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-medium transition-shadow">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-primary/10 rounded-16">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Register</h3>
              <p className="text-gray-600">
                Create your account as a farmer or veterinarian
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Connect</h3>
              <p className="text-gray-600">
                Find and connect with veterinarians in your area
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Manage</h3>
              <p className="text-gray-600">
                Track livestock health, book appointments, and learn
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-cream">
            Join thousands of farmers and veterinarians using VetLink
          </p>
          <Link href="/auth/register">
            <Button variant="accent" size="lg">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

