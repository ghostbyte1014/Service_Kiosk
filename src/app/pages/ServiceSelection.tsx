import React from 'react';
import { useQueue } from '../context/QueueContext';
import { useNavigate } from 'react-router';
import { Building2, X, Clock, Users, Zap, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';


export const ServiceSelection: React.FC = () => {
  const { services, queue, addToQueue, getEstimatedWaitTime } = useQueue();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [showModal, setShowModal] = React.useState(false);
  const [queueItem, setQueueItem] = React.useState<any>(null);

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => {
        setShowModal(false);
        setQueueItem(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [showModal]);

  const handleServiceSelect = (serviceId: string, priority = false) => {
    const item = addToQueue(serviceId, priority);
    setQueueItem(item);
    setShowModal(true);
  };

  const getWaitingCount = (serviceId: string) => {
    const today = new Date().toDateString();
    return queue.filter(q =>
      q.serviceId === serviceId &&
      q.status === 'waiting' &&
      new Date(q.timestamp).toDateString() === today
    ).length;
  };

  const service = queueItem ? services.find((s: any) => s.id === queueItem.serviceId) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border/40 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/5 rounded-xl">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Service Kiosk</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Please select the service you need</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-right">
            <button
              onClick={() => navigate('/how-it-works')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <HelpCircle className="w-4 h-4" /> Help
            </button>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => {
              const waitingCount = getWaitingCount(service.id);
              const eta = getEstimatedWaitTime(service.id);
              return (
                <div key={service.id} className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card hover:shadow-lg hover:border-border transition-all duration-300">
                  <div
                    className="absolute left-0 top-0 bottom-0 w-2 transition-transform duration-300 group-hover:scale-y-110"
                    style={{ backgroundColor: service.color }}
                  />
                  <div className="pl-6 pr-6 pt-8 pb-6 flex flex-col h-full">
                    <div>
                      <div
                        className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-lg font-bold mb-5"
                        style={{ backgroundColor: `${service.color}18`, color: service.color }}
                      >
                        {service.prefix}
                      </div>
                      <h3 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
                        {service.name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Get a queue ticket for {service.name.toLowerCase()} services.
                      </p>

                      {/* Live Stats */}
                      <div className="flex items-center gap-4 mb-6 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span><span className="font-semibold text-foreground">{waitingCount}</span> waiting</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>~<span className="font-semibold text-foreground">{eta}</span> min wait</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleServiceSelect(service.id, false)}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold border border-border/60 hover:bg-muted/50 transition-colors text-foreground"
                      >
                        Get Ticket
                      </button>
                      <button
                        onClick={() => handleServiceSelect(service.id, true)}
                        title="Priority / PWD / Senior Citizen"
                        className="px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700/40"
                      >
                        <Zap className="w-4 h-4" />
                        Priority
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-card/40 border-t border-border/40 p-6 flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground text-center">
          Need help? Our staff at the information desk are ready to assist you.
          <span className="ml-2 text-amber-600 dark:text-amber-400 font-medium">⚡ Priority lane available for Senior Citizens & PWDs.</span>
        </p>
        <button
          onClick={() => navigate('/how-it-works')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4 mt-2"
        >
          <HelpCircle className="w-4 h-4" /> Read how the system works
        </button>
      </div>

      {/* Queue Number Modal */}
      <AnimatePresence>
        {showModal && queueItem && service && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 100 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              <div
                className="text-white p-8 text-center"
                style={{ backgroundColor: service.color }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <span className="text-5xl">🎫</span>
                </motion.div>
                <h2 className="text-3xl font-bold mb-1">Queue Number Generated!</h2>
                {queueItem.priority && (
                  <span className="inline-flex items-center gap-1 text-sm font-semibold bg-white/20 rounded-full px-3 py-1 mt-2">
                    <Zap className="w-4 h-4" /> Priority Ticket
                  </span>
                )}
              </div>

              <div className="p-8 text-center">
                <p className="text-gray-600 dark:text-zinc-400 text-lg mb-2">Your Queue Number</p>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  className="text-8xl font-bold mb-4"
                  style={{ color: service.color }}
                >
                  {queueItem.number}
                </motion.div>

                <div className="bg-muted/40 rounded-2xl p-4 mb-4 text-left">
                  <p className="font-semibold text-foreground text-lg mb-1">{service.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Estimated wait: ~{getEstimatedWaitTime(service.id)} min</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Watch the <span className="font-semibold text-primary">display screen</span> for your number.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 text-muted-foreground text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Please stay in the waiting area</span>
                </div>
              </div>

              <div className="bg-muted/20 px-6 py-4 text-center text-sm text-muted-foreground">
                This window will close automatically in a few seconds...
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};