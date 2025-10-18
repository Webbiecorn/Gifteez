import React, { useEffect, useState } from 'react';
import ActivityLogService, { ActivityLogEntry } from '../services/activityLogService';
import LoadingSpinner from './LoadingSpinner';
import { ClockIcon, TrashIcon } from './IconComponents';

const ActivityLog: React.FC = () => {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const logs = await ActivityLogService.getRecentActivities(50);
      setActivities(logs);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Zojuist';
    if (diffMins < 60) return `${diffMins} min geleden`;
    if (diffHours < 24) return `${diffHours} uur geleden`;
    if (diffDays < 7) return `${diffDays} dag${diffDays > 1 ? 'en' : ''} geleden`;
    
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingSpinner message="Activity log laden..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-rose-500" />
            Recente Activiteiten
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Laatste {activities.length} acties in het systeem
          </p>
        </div>
        <button
          onClick={loadActivities}
          className="text-sm text-rose-600 hover:text-rose-700 font-medium"
        >
          🔄 Ververs
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <ClockIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">Nog geen activiteiten</p>
          <p className="text-sm text-gray-500 mt-1">Acties worden automatisch gelogd</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((activity, index) => {
            const icon = ActivityLogService.getActivityIcon(activity.type);
            const color = ActivityLogService.getActivityColor(activity.type);
            
            const colorClasses = {
              red: 'bg-red-50 border-red-200 text-red-900',
              green: 'bg-green-50 border-green-200 text-green-900',
              blue: 'bg-blue-50 border-blue-200 text-blue-900',
              gray: 'bg-gray-50 border-gray-200 text-gray-900',
            };

            return (
              <div
                key={activity.id || index}
                className={`border rounded-lg p-4 ${colorClasses[color as keyof typeof colorClasses]} hover:shadow-sm transition-shadow`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs opacity-75">
                      <span>{activity.user || 'Admin'}</span>
                      <span>•</span>
                      <span>{formatTime(activity.timestamp)}</span>
                    </div>
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer hover:underline">
                          Details
                        </summary>
                        <pre className="mt-1 text-xs bg-white/50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(activity.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
