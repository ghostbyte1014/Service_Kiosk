import React, { useEffect, useState, useRef } from 'react';
import { useQueue } from '../context/QueueContext';
import { Monitor, Clock, ArrowRight, Tv2, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useVoiceAnnouncement } from '../hooks/useVoiceAnnouncement';

export const PublicDisplay: React.FC = () => {
  const { services, counters, queue } = useQueue();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recentlyUpdated, setRecentlyUpdated] = useState<string[]>([]);
  const [lastCalledNumber, setLastCalledNumber] = useState<string | null>(null);
  const [tvMode, setTvMode] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const prevCountersRef = useRef<typeof counters>([]);
  const { announceTicket } = useVoiceAnnouncement();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Detect newly called numbers and trigger voice + highlight
  useEffect(() => {
    const prev = prevCountersRef.current;
    const changed = counters.filter(c => {
      const old = prev.find(p => p.id === c.id);
      return c.currentNumber && old?.currentNumber !== c.currentNumber;
    });

    if (changed.length > 0) {
      const updatedIds = changed.map(c => c.id);
      setRecentlyUpdated(prev => [...prev, ...updatedIds]);
      const newest = changed[changed.length - 1];
      if (newest.currentNumber) {
        setLastCalledNumber(newest.currentNumber);
        if (voiceEnabled) announceTicket(newest.currentNumber, newest.name);
        setTimeout(() => setLastCalledNumber(null), 6000);
        setTimeout(() => {
          setRecentlyUpdated(prev => prev.filter(id => !updatedIds.includes(id)));
        }, 4000);
      }
    }
    prevCountersRef.current = counters;
  }, [counters, voiceEnabled, announceTicket]);

  const getWaitingNumbers = (serviceId: string, limit = 6) => {
    return queue
      .filter(q => q.serviceId === serviceId && q.status === 'waiting')
      .sort((a, b) => {
        if (a.priority && !b.priority) return -1;
        if (!a.priority && b.priority) return 1;
        return a.timestamp - b.timestamp;
      })
      .slice(0, limit)
      .map(q => q.number);
  };

  const activeCounters = counters.filter(c => c.currentNumber);
  const groupedCounters = services.map(service => ({
    service,
    counters: activeCounters.filter(c => c.serviceId === service.id),
    waiting: getWaitingNumbers(service.id),
  })).filter(group => group.counters.length > 0 || group.waiting.length > 0);

  return (
    <div className={`min-h-[100dvh] bg-background text-foreground flex flex-col font-sans transition-all ${tvMode ? 'tv-mode' : ''}`}>
      {/* Header */}
      <div className="bg-card/90 backdrop-blur-xl border-b border-border/60 p-4 lg:p-6 sticky top-0 z-40">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/5 rounded-2xl hidden sm:flex">
              <Monitor className="w-8 h-8 lg:w-10 lg:h-10 text-primary" />
            </div>
            <div>
              <h1 className={`font-bold tracking-tight text-foreground ${tvMode ? 'text-5xl' : 'text-2xl lg:text-4xl'}`}>Queue Display</h1>
              {!tvMode && <p className="text-muted-foreground text-sm lg:text-lg mt-0.5">Please watch for your queue ticket number</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!tvMode && (
              <>
                <button
                  onClick={() => setVoiceEnabled(prev => !prev)}
                  title={voiceEnabled ? 'Mute voice announcements' : 'Enable voice announcements'}
                  className={`p-2.5 rounded-xl border transition-colors ${voiceEnabled ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'}`}
                >
                  {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setTvMode(true)}
                  title="Enter TV / Large Display Mode"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-muted/50 hover:bg-muted text-sm font-medium transition-colors"
                >
                  <Tv2 className="w-5 h-5" />
                  <span className="hidden sm:inline">TV Mode</span>
                </button>
              </>
            )}
            {tvMode && (
              <button
                onClick={() => setTvMode(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-sm font-medium transition-colors"
              >
                Exit TV Mode
              </button>
            )}
            <div className="text-right">
              {!tvMode && (
                <div className="flex items-center gap-2 text-muted-foreground justify-end mb-0.5 hidden sm:flex">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )}
              <p className={`font-bold tracking-tighter text-foreground font-mono ${tvMode ? 'text-6xl' : 'text-3xl lg:text-5xl'}`}>
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      <AnimatePresence>
        {lastCalledNumber && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-primary overflow-hidden"
          >
            <div className="max-w-[1920px] mx-auto px-4 lg:px-8 py-6 lg:py-8">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 lg:gap-8 text-center sm:text-left">
                <span className={`animate-bounce ${tvMode ? 'text-6xl' : 'text-3xl lg:text-4xl'}`}>🔔</span>
                <p className={`font-bold tracking-tight text-primary-foreground ${tvMode ? 'text-5xl' : 'text-2xl lg:text-3xl'}`}>NOW CALLING:</p>
                <div className="bg-background text-foreground px-6 lg:px-10 py-3 lg:py-4 rounded-2xl shadow-xl border border-border/20">
                  <p className={`font-bold tracking-tighter ${tvMode ? 'text-9xl' : 'text-5xl lg:text-7xl'}`}>{lastCalledNumber}</p>
                </div>
                <p className={`font-semibold text-primary-foreground/90 ${tvMode ? 'text-4xl' : 'text-2xl lg:text-3xl'}`}>
                  {(() => {
                    const counter = counters.find(c => c.currentNumber === lastCalledNumber);
                    return counter ? `Please proceed to ${counter.name}` : '';
                  })()}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Display */}
      <div className="flex-1 w-full max-w-[1920px] mx-auto p-4 lg:p-8">
        {groupedCounters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[50vh]">
            <div className="p-8 bg-muted rounded-full mb-6">
              <Monitor className={`text-muted-foreground/30 ${tvMode ? 'w-32 h-32' : 'w-16 h-16 lg:w-24 lg:h-24'}`} />
            </div>
            <p className={`font-bold tracking-tight text-foreground text-center ${tvMode ? 'text-5xl' : 'text-2xl lg:text-4xl'}`}>No active queues at the moment</p>
            <p className={`text-muted-foreground mt-4 text-center max-w-md ${tvMode ? 'text-3xl' : 'text-lg lg:text-xl'}`}>Please get your queue ticket from the selection kiosk to begin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 auto-rows-max">
            {groupedCounters.map(({ service, counters: serviceCounters, waiting }) => (
              <div key={service.id} className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="px-6 lg:px-8 py-5 flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundColor: service.color }} />
                  <div
                    className={`rounded-2xl flex items-center justify-center font-bold text-white shadow-sm ring-1 ring-white/20 z-10 ${tvMode ? 'w-20 h-20 text-4xl' : 'w-14 h-14 lg:w-16 lg:h-16 text-3xl'}`}
                    style={{ backgroundColor: service.color }}
                  >
                    {service.prefix}
                  </div>
                  <h2 className={`font-bold tracking-tight text-foreground z-10 ${tvMode ? 'text-5xl' : 'text-2xl lg:text-3xl'}`}>{service.name}</h2>
                </div>

                <div className="p-6 lg:p-8 flex-1 flex flex-col gap-8">
                  {serviceCounters.length > 0 && (
                    <div>
                      <h3 className={`font-semibold tracking-wider text-muted-foreground uppercase mb-4 ${tvMode ? 'text-lg' : 'text-sm'}`}>Now Serving</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence mode="popLayout">
                          {serviceCounters.map((counter) => (
                            <motion.div
                              key={counter.id}
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: recentlyUpdated.includes(counter.id) ? [1, 1.02, 1] : 1, opacity: 1 }}
                              exit={{ scale: 0.95, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className={`rounded-2xl p-5 lg:p-6 relative overflow-hidden transition-colors ${
                                recentlyUpdated.includes(counter.id)
                                  ? 'bg-primary/5 border-2 border-primary shadow-md'
                                  : 'bg-muted/40 border border-border'
                              }`}
                            >
                              <div className="relative flex flex-col h-full justify-between gap-4">
                                <div className="flex items-center justify-between">
                                  <p className={`text-foreground font-medium ${tvMode ? 'text-xl' : ''}`}>{counter.name}</p>
                                  {recentlyUpdated.includes(counter.id) && (
                                    <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: Infinity }} className="text-xl">🔔</motion.span>
                                  )}
                                </div>
                                <div className="flex items-end justify-between">
                                  <p
                                    className={`font-bold tracking-tighter ${tvMode ? 'text-9xl' : 'text-6xl lg:text-7xl'}`}
                                    style={{ color: service.color }}
                                  >
                                    {counter.currentNumber}
                                  </p>
                                  <ArrowRight className={`text-muted-foreground opacity-50 ${tvMode ? 'w-14 h-14' : 'w-8 h-8 lg:w-10 lg:h-10'}`} strokeWidth={2} />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {waiting.length > 0 && (
                    <div className="mt-auto">
                      <div className="bg-muted/30 rounded-2xl p-5 lg:p-6 border border-border/40">
                        <h3 className={`font-semibold tracking-wider text-muted-foreground uppercase mb-4 ${tvMode ? 'text-lg' : 'text-sm'}`}>
                          Next in Queue ({waiting.length})
                        </h3>
                        <div className="flex flex-wrap gap-2 lg:gap-3">
                          {waiting.map((number, index) => (
                            <motion.div
                              key={number}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="bg-background border border-border rounded-lg px-4 py-2 shadow-sm"
                            >
                              <span className={`font-bold text-foreground tracking-tight ${tvMode ? 'text-3xl' : 'text-lg lg:text-xl'}`}>
                                {number}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};