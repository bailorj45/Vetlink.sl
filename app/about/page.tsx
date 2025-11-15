import { Card } from '@/components/ui/Card';
import { Heart, Target, Users, Award } from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: 'Compassion',
      description: 'We care deeply about animal welfare and farmer livelihoods',
    },
    {
      icon: Target,
      title: 'Excellence',
      description: 'We strive for the highest quality in veterinary care',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building strong connections between farmers and vets',
    },
    {
      icon: Award,
      title: 'Innovation',
      description: 'Leveraging technology to improve agricultural outcomes',
    },
  ];

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-primary mb-4">About VetLink</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering Sierra Leone's agricultural community through digital innovation
          </p>
        </div>

        <div className="mb-16">
          <Card className="mb-8">
            <h2 className="text-3xl font-bold text-primary mb-4">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              VetLink Sierra Leone is dedicated to bridging the gap between farmers
              and veterinary professionals. We believe that access to quality
              veterinary care and agricultural knowledge should be available to all,
              regardless of location or resources.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our platform provides farmers with tools to manage livestock health,
              connect with certified veterinarians, access educational resources, and
              stay informed about disease outbreaks. For veterinarians, we offer a
              platform to reach more farmers and build their practice.
            </p>
          </Card>

          <Card>
            <h2 className="text-3xl font-bold text-primary mb-4">Our Vision</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              To become the leading digital platform for livestock health management
              in Sierra Leone, improving animal welfare, increasing agricultural
              productivity, and supporting the livelihoods of farming communities
              across the country.
            </p>
          </Card>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-primary text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-primary/10 rounded-16">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        <Card>
          <h2 className="text-3xl font-bold text-primary mb-4">What We Offer</h2>
          <div className="space-y-4 text-lg text-gray-700">
            <div>
              <h3 className="font-bold text-primary mb-2">For Farmers:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Easy access to certified veterinarians in your district</li>
                <li>Digital livestock health records and medical history</li>
                <li>AI-powered symptom checker and feed calculator</li>
                <li>Breeding and reproduction tracking</li>
                <li>Educational resources and audio lessons</li>
                <li>Real-time disease alerts and newsfeed</li>
                <li>Emergency SOS feature for urgent cases</li>
              </ul>
            </div>
            <div className="mt-6">
              <h3 className="font-bold text-primary mb-2">For Veterinarians:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Professional profile and verification system</li>
                <li>Appointment management and scheduling</li>
                <li>Access to farmer network in your district</li>
                <li>Rating and review system</li>
                <li>Platform to share expertise and knowledge</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

