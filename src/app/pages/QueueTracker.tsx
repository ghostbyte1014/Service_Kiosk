import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQueue } from '../context/QueueContext';
import { Clock, Users, CheckCircle, Zap, Home } from 'lucide-react';

export const QueueTracker: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { queue, services, counters, getEstimatedWaitTime } = useQueue();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Poll every 3s to simulate real-time updates from localStorage
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 3000);
    return () => clearInterval(timer);
  }, []);

  const queueItem = queue.find(q => q.id === id);
  const service = queueItem ? services.find(s => s.id === queueItem.serviceId) : null;

  // Position in queue (how many waiting before this person)
  const position = queueItem && queueItem.status === 'waiting'
    ? queue
      .filter(q =>
        q.serviceId === queueItem.serviceId &&
        q.status === 'waiting' &&
        (q.priority ? !queueItem.priority || q.timestamp < queueItem.timestamp : q.timestamp < queueItem.timestamp)
      )
      .length + 1
    : null;

  const currentlyServing = service
    ? counters.find(c => c.serviceId === service.id && c.currentNumber)
    : null;

  const eta = service ? getEstimatedWaitTime(service.id) : 0;

  const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    waiting: { label: 'Waiting', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    serving: { label: 'Being Served Now!', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    completed: { label: 'Service Completed', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    skipped: { label: 'Skipped — Please return to counter', icon: Clock, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  };

  if (!queueItem || !service) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center p-8 font-sans">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Ticket Not Found</h1>
          <p className="text-muted-foreground mb-6">This queue ticket doesn't exist or has expired.</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">
            Back to Kiosk
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[queueItem.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-[100dvh] bg-background font-sans text-foreground">
      <div className="max-w-sm mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Queue Tracker</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{service.name} • Live Updates</p>
        </div>

        {/* Ticket Number Card */}
        <div className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden">
          <div className="h-2 w-full" style={{ backgroundColor: service.color }} />
          <div className="p-8 text-center">
            {queueItem.priority && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-full px-2.5 py-1 border border-amber-200 dark:border-amber-700/40 mb-3">
                <Zap className="w-3 h-3" /> Priority Ticket
              </span>
            )}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Your Number</p>
            <p className="text-7xl font-black tracking-tighter" style={{ color: service.color }}>
              {queueItem.number}
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div className={`rounded-2xl p-5 ${statusInfo.bg} border border-border/40 flex items-center gap-4`}>
          <div className={`p-3 rounded-xl bg-white/60 dark:bg-black/20`}>
            <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</p>
            <p className={`text-lg font-bold ${statusInfo.color}`}>{statusInfo.label}</p>
          </div>
        </div>

        {/* Position & ETA */}
        {queueItem.status === 'waiting' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-2xl border border-border/60 p-5 text-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Position</p>
              <p className="text-4xl font-black text-foreground">{position}</p>
              <p className="text-xs text-muted-foreground">in queue</p>
            </div>
            <div className="bg-card rounded-2xl border border-border/60 p-5 text-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Est. Wait</p>
              <p className="text-4xl font-black text-foreground">~{eta}</p>
              <p className="text-xs text-muted-foreground">minutes</p>
            </div>
          </div>
        )}

        {/* Currently Serving */}
        {currentlyServing && (
          <div className="bg-card rounded-2xl border border-border/60 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Now Serving at {currentlyServing.name}</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{currentlyServing.currentNumber}</p>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: `${service.color}15` }}>
              <Users className="w-6 h-6" style={{ color: service.color }} />
            </div>
          </div>
        )}

        {/* Instructions */}
        {queueItem.status === 'waiting' && (
          <div className="bg-muted/40 border border-border/40 rounded-2xl p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Stay near the waiting area.</strong> This page refreshes every few seconds. Watch the public display for your number.
            </p>
          </div>
        )}

        {queueItem.status === 'serving' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 rounded-2xl p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium text-center">
              🎉 Your number is being called! Please proceed to the counter now.
            </p>
          </div>
        )}

        {/* Last Updated */}
        <p className="text-center text-xs text-muted-foreground">
          Last updated: {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>

        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm font-medium"
        >
          <Home className="w-4 h-4" /> Back to Kiosk
        </button>
      </div>
    </div>
  );
};
