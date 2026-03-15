import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useQueue } from '../context/QueueContext';
import { PhoneCall, CheckCircle, SkipForward, RotateCcw, LogOut, Users, Clock, TrendingUp, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAudio } from '../hooks/useAudio';

export const CounterDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    counters, services, queue, currentUser,
    callNext, finishService, skipNumber, recallNumber,
    logout, getEstimatedWaitTime
  } = useQueue();
  const { playChime } = useAudio();

  const counterId = location.state?.counterId as string;
  const [showNotification, setShowNotification] = useState(false);
  const [sessionStats, setSessionStats] = useState({ served: 0, startTime: Date.now() });

  useEffect(() => {
    if (!currentUser || !counterId) navigate('/staff-login');
  }, [currentUser, counterId, navigate]);

  const counter = counters.find(c => c.id === counterId);
  const service = services.find(s => s.id === counter?.serviceId);
  const currentItem = queue.find(q => q.number === counter?.currentNumber && q.status === 'serving');

  const waitingQueue = queue
    .filter(q => q.serviceId === counter?.serviceId && q.status === 'waiting')
    .sort((a, b) => {
      if (a.priority && !b.priority) return -1;
      if (!a.priority && b.priority) return 1;
      return a.timestamp - b.timestamp;
    });

  const skippedQueue = queue
    .filter(q => q.serviceId === counter?.serviceId && q.status === 'skipped')
    .sort((a, b) => a.timestamp - b.timestamp);

  const handleCallNext = () => {
    if (!counterId) return;
    const nextItem = callNext(counterId);
    if (nextItem) {
      playChime();
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  const handleFinish = () => {
    if (!counterId) return;
    finishService(counterId);
    setSessionStats(prev => ({ ...prev, served: prev.served + 1 }));
  };

  const handleSkip = () => {
    if (!counterId) return;
    skipNumber(counterId);
  };

  const handleRecall = (number: string) => {
    if (!counterId) return;
    recallNumber(number, counterId);
    playChime();
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/staff-login');
  };

  const [serviceTime, setServiceTime] = useState(0);
  const getServiceTime = () => {
    if (!currentItem?.calledAt) return 0;
    return Math.floor((Date.now() - currentItem.calledAt) / 1000);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentItem) setServiceTime(getServiceTime());
    }, 1000);
    return () => clearInterval(timer);
  }, [currentItem]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!counter || !service || !currentUser) return null;

  const eta = getEstimatedWaitTime(service.id);

  return (
    <div className="min-h-[100dvh] bg-background font-sans text-foreground">
      {/* Header */}
      <div className="bg-card border-b border-border/40 sticky top-0 z-40">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-sm"
                style={{ backgroundColor: service.color }}
              >
                {service.prefix}
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-foreground">{counter.name}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">{service.name} • <span className="font-medium text-foreground">{currentUser.name}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden sm:block text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Session</p>
                <p className="text-lg font-bold text-foreground">{sessionStats.served} <span className="text-muted-foreground font-medium text-sm">Served</span></p>
              </div>
              <div className="h-8 w-px bg-border hidden sm:block"></div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors font-medium text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">End Session</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Call notification */}
      <AnimatePresence>
        {showNotification && currentItem && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="px-8 py-4 rounded-full shadow-lg text-white flex items-center gap-4 bg-foreground/90 backdrop-blur-md">
              <span className="text-2xl animate-pulse">🔔</span>
              <div>
                <p className="text-xs uppercase tracking-wider opacity-80 font-medium">Now Calling</p>
                <p className="text-2xl font-bold tracking-tight">{currentItem.number}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1920px] mx-auto p-4 lg:p-6 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">

          {/* Main Panel */}
          <div className="xl:col-span-3 space-y-6 lg:space-y-8 flex flex-col h-full">

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 lg:gap-6">
              <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-5 lg:p-6 flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl hidden sm:block">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Waiting</p>
                  <p className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">{waitingQueue.length}</p>
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-5 lg:p-6 flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 rounded-xl hidden sm:block">
                  <SkipForward className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Skipped</p>
                  <p className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">{skippedQueue.length}</p>
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-5 lg:p-6 flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-xl hidden sm:block">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Served</p>
                  <p className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">{sessionStats.served}</p>
                </div>
              </div>
            </div>

            {/* Current Number Terminal */}
            <div className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[400px]">
              <div className="px-6 lg:px-8 py-5 border-b border-border/40 bg-muted/20">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">Active Service Session</h2>
              </div>
              <div className="p-6 lg:p-10 flex-1 flex flex-col items-center justify-center">
                {currentItem ? (
                  <div className="text-center w-full max-w-2xl mx-auto">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <p className="text-sm uppercase tracking-widest text-muted-foreground font-semibold">Currently Serving</p>
                      {currentItem.priority && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 rounded-full px-2 py-0.5 border border-amber-200 dark:border-amber-700/40">
                          <Zap className="w-3 h-3" /> Priority
                        </span>
                      )}
                    </div>
                    <div
                      className="text-8xl lg:text-[160px] font-bold tracking-tighter leading-none mb-8"
                      style={{ color: service.color }}
                    >
                      {currentItem.number}
                    </div>
                    <div className="inline-flex items-center justify-center gap-2 bg-muted/50 rounded-full px-6 py-2 mb-10 text-muted-foreground border border-border/50">
                      <Clock className="w-4 h-4" />
                      <span className="text-lg font-medium font-mono">{formatTime(serviceTime)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                      <button
                        onClick={handleSkip}
                        className="flex-1 py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold border border-border bg-card hover:bg-muted text-muted-foreground"
                      >
                        <SkipForward className="w-5 h-5" /> Skip Number
                      </button>
                      <button
                        onClick={handleFinish}
                        className="flex-[2] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                      >
                        <CheckCircle className="w-5 h-5" /> Finish & Close Service
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center w-full max-w-lg mx-auto py-12">
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="w-10 h-10 text-muted-foreground/50" />
                    </div>
                    <p className="text-2xl font-bold tracking-tight text-foreground mb-2">Ready to serve</p>
                    <p className="text-muted-foreground mb-10">Call the next customer to begin a session.</p>
                    <button
                      onClick={handleCallNext}
                      disabled={waitingQueue.length === 0}
                      className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:border disabled:border-border text-primary-foreground font-bold py-5 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-sm text-lg disabled:cursor-not-allowed"
                    >
                      <PhoneCall className="w-6 h-6" />
                      {waitingQueue.length === 0 ? 'Queue is empty' : 'Call Next Customer'}
                    </button>
                    {waitingQueue.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-4">
                        Est. wait for next customer: <span className="font-semibold text-foreground">~{eta} min</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="xl:col-span-1 space-y-6 lg:space-y-8 flex flex-col">

            {/* Waiting Queue */}
            <div className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[300px] xl:max-h-[600px]">
              <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between bg-muted/20">
                <h3 className="font-semibold tracking-tight text-foreground">Next in line ({waitingQueue.length})</h3>
                {waitingQueue.length > 0 && <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>}
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                {waitingQueue.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
                    <p>No one is waiting.</p>
                  </div>
                ) : (
                  <div className="space-y-2 lg:space-y-3">
                    {waitingQueue.slice(0, 15).map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-muted/40 border border-border/50 rounded-xl hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 text-muted-foreground flex items-center justify-center font-medium text-xs">
                            {index + 1}
                          </span>
                          <span className="font-bold text-lg tracking-tight text-foreground">{item.number}</span>
                          {item.priority && (
                            <span title="Priority ticket">
                              <Zap className="w-4 h-4 text-amber-500" />
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground font-mono bg-background px-2 py-1 rounded shadow-sm border border-border/40">
                          {new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Skipped Queue */}
            {skippedQueue.length > 0 && (
              <div className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden flex flex-col xl:max-h-[400px]">
                <div className="px-6 py-4 border-b border-border/40 flex items-center gap-2 bg-orange-500/5">
                  <h3 className="font-semibold tracking-tight text-foreground">Skipped</h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">{skippedQueue.length}</span>
                </div>
                <div className="p-4 overflow-y-auto max-h-64">
                  <div className="space-y-2">
                    {skippedQueue.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 lg:p-4 border border-border/50 rounded-xl bg-orange-50/50 dark:bg-orange-900/10 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{item.number}</span>
                          {item.priority && <Zap className="w-3.5 h-3.5 text-amber-500" />}
                        </div>
                        <button
                          onClick={() => handleRecall(item.number)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border shadow-sm hover:bg-muted text-muted-foreground rounded-lg text-xs font-medium transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" /> Recall
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
