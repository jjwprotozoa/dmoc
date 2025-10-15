// src/components/dashboard/ActivityFeed.tsx
'use client';

import { useSocket } from '@/hooks/useSocket';
// import { trpc } from '@/lib/trpc';
import { AlertTriangle, Clock, MapPin, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  data: unknown;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const { socket } = useSocket();

  // const { data: offenses } = trpc.offenses.getAll.useQuery({});
  // const { data: webhookEvents } = trpc.manifest.getAll.useQuery({});

  useEffect(() => {
    if (socket) {
      socket.on('ping:new', (ping) => {
        setActivities(prev => [{
          id: `ping-${ping.id}`,
          type: 'location',
          title: 'New Location Update',
          description: `Device ${ping.device.externalId} reported location`,
          timestamp: ping.timestamp,
          data: ping,
        }, ...prev.slice(0, 19)]);
      });

      socket.on('webhook:new', (event) => {
        setActivities(prev => [{
          id: `webhook-${event.id}`,
          type: 'webhook',
          title: 'WhatsApp Message Received',
          description: event.payload.message?.substring(0, 50) + '...',
          timestamp: event.createdAt,
          data: event,
        }, ...prev.slice(0, 19)]);
      });

      return () => {
        socket.off('ping:new');
        socket.off('webhook:new');
      };
    }
  }, [socket]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'location':
        return <MapPin className="h-4 w-4 text-blue-500" />;
      case 'webhook':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'offense':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Activity Feed</h2>
      </div>
      
      <div className="overflow-y-auto h-[calc(100%-4rem)]">
        {activities.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Clock className="h-8 w-8 mx-auto mb-2" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="divide-y">
            {activities.map((activity) => (
              <div key={activity.id} className="p-4">
                <div className="flex items-start space-x-3">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
