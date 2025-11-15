import React from 'react';
import { Calendar, Clock, User, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Appointment } from '@/lib/types';
import { format } from 'date-fns';

interface AppointmentCardProps {
  appointment: Appointment;
  onAction?: (action: 'view' | 'cancel' | 'reschedule' | 'accept' | 'decline') => void;
  showActions?: boolean;
  userRole?: 'farmer' | 'vet' | 'admin';
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onAction,
  showActions = true,
  userRole = 'farmer',
}) => {
  const statusColors = {
    pending: 'warning',
    confirmed: 'success',
    completed: 'info',
    cancelled: 'error',
  } as const;

  const urgencyColors = {
    low: 'info',
    medium: 'warning',
    high: 'error',
    emergency: 'error',
  } as const;

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold mb-2">
            {userRole === 'farmer' && appointment.vet
              ? appointment.vet.fullName
              : userRole === 'vet' && appointment.farmer
              ? appointment.farmer.fullName
              : 'Appointment'}
          </h3>
          <p className="text-sm text-gray-600">{appointment.reason}</p>
        </div>
        <Badge variant={statusColors[appointment.status]}>
          {appointment.status}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">
            {format(new Date(appointment.date), 'MMM dd, yyyy')}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{appointment.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <Badge variant={urgencyColors[appointment.urgency]} className="text-xs">
            {appointment.urgency}
          </Badge>
        </div>
      </div>

      {showActions && onAction && (
        <div className="flex gap-2 mt-4">
          {userRole === 'vet' && appointment.status === 'pending' && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onAction('accept')}
              >
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction('decline')}
              >
                Decline
              </Button>
            </>
          )}
          {userRole === 'farmer' && appointment.status !== 'completed' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction('view')}
              >
                View
              </Button>
              {appointment.status !== 'cancelled' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAction('cancel')}
                >
                  Cancel
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
};

