import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Badge } from './ui/Badge';
import { cn } from '@/utils/cn';
import { DiseaseAlert } from '@/lib/types';

interface AlertBannerProps {
  alert: DiseaseAlert;
  onDismiss?: () => void;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  alert,
  onDismiss,
  className,
}) => {
  const severityColors = {
    low: 'bg-blue-50 border-blue-200',
    medium: 'bg-yellow-50 border-yellow-200',
    high: 'bg-orange-50 border-orange-200',
    critical: 'bg-red-50 border-red-200',
  };

  const severityBadgeColors = {
    low: 'info',
    medium: 'warning',
    high: 'error',
    critical: 'error',
  } as const;

  return (
    <div
      className={cn(
        'border-l-4 rounded-8 p-4 mb-4',
        severityColors[alert.severity],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <AlertCircle
            className={cn(
              'w-5 h-5 mt-0.5 flex-shrink-0',
              alert.severity === 'critical' || alert.severity === 'high'
                ? 'text-red-600'
                : alert.severity === 'medium'
                ? 'text-yellow-600'
                : 'text-blue-600'
            )}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-lg">{alert.title}</h4>
              <Badge variant={severityBadgeColors[alert.severity]}>
                {alert.severity}
              </Badge>
            </div>
            <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <span>
                <strong>Species:</strong> {alert.affectedSpecies.join(', ')}
              </span>
              {alert.affectedDistricts.length > 0 && (
                <span>
                  <strong>Districts:</strong> {alert.affectedDistricts.join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-white/50 rounded-4 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

