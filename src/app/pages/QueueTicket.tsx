import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useQueue, QueueItem } from '../context/QueueContext';
import { Printer, Home, Clock, Zap } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const QueueTicket: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { services, getEstimatedWaitTime } = useQueue();
  const queueItem = location.state?.queueItem as QueueItem;

  useEffect(() => {
    if (!queueItem) navigate('/');
  }, [queueItem, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => navigate('/'), 15000);
    return () => clearTimeout(timer);
  }, [navigate]);

  if (!queueItem) return null;

  const service = services.find(s => s.id === queueItem.serviceId);
  const timestamp = new Date(queueItem.timestamp);
  const eta = getEstimatedWaitTime(queueItem.serviceId);
  const trackingUrl = `${window.location.origin}/track/${queueItem.id}`;

  const handlePrint = () => window.print();

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex items-center justify-center p-4 lg:p-8 font-sans">
      <div className="w-full max-w-md">

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
            <Printer className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Queue Ticket Generated</h1>
        </div>

        {/* Ticket Card */}
        <div className="bg-card rounded-3xl shadow-sm border border-border/60 overflow-hidden relative backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: service?.color || 'transparent' }} />
          <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-background border-r border-border/60 -translate-y-1/2" />
          <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-background border-l border-border/60 -translate-y-1/2" />
          <div className="absolute top-1/2 left-4 right-4 h-px border-t-2 border-dashed border-border/40 -translate-y-1/2" />

          {/* Top half */}
          <div className="p-8 pb-12 text-center relative z-10">
            {queueItem.priority && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-full px-2.5 py-1 border border-amber-200 dark:border-amber-700/40 mb-3">
                <Zap className="w-3 h-3" /> Priority Ticket
              </span>
            )}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Your Number</p>
            <div
              className="text-7xl lg:text-8xl font-black tracking-tighter mb-2"
              style={{ color: service?.color || 'inherit' }}
            >
              {queueItem.number}
            </div>
            <p className="text-lg font-medium text-foreground">{service?.name || 'Unknown Service'}</p>
          </div>

          {/* Bottom half */}
          <div className="p-8 pt-10 text-center relative z-10">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Clock className="w-4 h-4" />
              <span className="font-medium text-foreground">
                {timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-border/60">•</span>
              <span>{timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>

            {/* ETA */}
            <div className="bg-muted/30 border border-border/40 rounded-2xl p-4 mb-5 text-center">
              <p className="text-sm text-muted-foreground mb-1">Estimated Wait Time</p>
              <p className="text-3xl font-bold text-foreground">~{eta} <span className="text-lg font-medium text-muted-foreground">min</span></p>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-2 mb-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Track Your Queue</p>
              <div className="p-3 bg-white rounded-2xl border border-border/40 shadow-sm inline-block">
                <QRCodeSVG value={trackingUrl} size={120} level="M" />
              </div>
              <p className="text-xs text-muted-foreground">Scan to track your position live</p>
            </div>

            <div className="bg-muted/30 border border-border/40 rounded-2xl p-4 mb-6 text-left relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40 rounded-l-2xl" />
              <p className="text-sm text-muted-foreground leading-relaxed pl-2">
                <strong className="text-foreground font-semibold">Please note:</strong> Watch the public display screen for your number. Ensure you are in the waiting area when called.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handlePrint}
                className="flex-1 h-12 inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-colors border border-input bg-card hover:bg-muted/50 hover:text-foreground shadow-sm text-muted-foreground"
              >
                <Printer className="w-4 h-4 mr-2" /> Print
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 h-12 inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-colors bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              >
                <Home className="w-4 h-4 mr-2" /> Done
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Returning to main screen in a few seconds...
        </p>
      </div>
    </div>
  );
};
