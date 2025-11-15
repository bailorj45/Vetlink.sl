import React from 'react';
import { MapPin, Star, Clock, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Veterinarian } from '@/lib/types';

interface VetCardProps {
  vet: Veterinarian;
  onBook?: () => void;
  showBookButton?: boolean;
}

export const VetCard: React.FC<VetCardProps> = ({
  vet,
  onBook,
  showBookButton = true,
}) => {
  return (
    <Card className="hover:shadow-medium transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold">{vet.fullName}</h3>
            {vet.verified && (
              <CheckCircle className="w-5 h-5 text-primary" title="Verified" />
            )}
          </div>
          <p className="text-secondary font-medium">{vet.specialization}</p>
        </div>
        {vet.rating && (
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-accent text-accent" />
            <span className="font-semibold">{vet.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{vet.district}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm capitalize">{vet.availability}</span>
        </div>
        <p className="text-sm text-gray-600">{vet.yearsOfExperience} years experience</p>
      </div>

      {vet.bio && (
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{vet.bio}</p>
      )}

      <div className="flex items-center justify-between">
        <Badge
          variant={
            vet.availability === 'available'
              ? 'success'
              : vet.availability === 'busy'
              ? 'warning'
              : 'error'
          }
        >
          {vet.availability}
        </Badge>
        {showBookButton && (
          <Button variant="primary" size="sm" onClick={onBook}>
            Book Appointment
          </Button>
        )}
      </div>
    </Card>
  );
};

