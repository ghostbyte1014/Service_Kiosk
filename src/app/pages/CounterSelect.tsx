import React from 'react';
import { useNavigate } from 'react-router';
import { useQueue } from '../context/QueueContext';
import { Monitor, LogOut, User } from 'lucide-react';

export const CounterSelect: React.FC = () => {
  const { counters, services, currentUser, assignCounter, logout } = useQueue();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!currentUser) {
      navigate('/staff-login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const availableCounters = currentUser.role === 'admin' 
    ? counters
    : counters.filter(c => c.serviceId === currentUser.serviceId);

  const handleCounterSelect = (counterId: string) => {
    assignCounter(counterId, currentUser.id);
    navigate('/counter-dashboard', { state: { counterId } });
  };

  const handleLogout = () => {
    logout();
    navigate('/staff-login');
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="bg-card border-b border-border/40 sticky top-0 z-10 backdrop-blur-sm shadow-sm/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground leading-tight">Welcome, {currentUser.name}</h1>
              <p className="text-xs text-muted-foreground">Select your counter to begin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-destructive/10 hover:text-destructive h-9 px-4 py-2 text-muted-foreground hover:border-destructive/20 border border-transparent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </header>

      {/* Counter Selection */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <div className="mb-6 lg:mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-1">Select Counter</h2>
          <p className="text-muted-foreground text-sm">Choose the counter you'll be serving today</p>
        </div>

        {availableCounters.length === 0 ? (
          <div className="bg-card border border-border/40 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Monitor className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-medium text-foreground">No counters available</p>
            <p className="text-muted-foreground text-sm mt-1">There are no counters assigned to your service role right now. Please contact your administrator.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {availableCounters.map((counter) => {
              const service = services.find(s => s.id === counter.serviceId);
              const isOccupied = counter.staffId && counter.staffId !== currentUser.id;

              return (
                <button
                  key={counter.id}
                  onClick={() => !isOccupied && handleCounterSelect(counter.id)}
                  disabled={isOccupied}
                  className={`group relative text-left bg-card border rounded-2xl shadow-sm transition-all duration-200 overflow-hidden ${
                    isOccupied
                      ? 'border-border/40 opacity-60 cursor-not-allowed bg-muted/20'
                      : 'border-border/60 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: isOccupied ? 'transparent' : service?.color || 'transparent' }} />
                  
                  <div className="p-5 lg:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOccupied ? 'bg-muted/50' : 'bg-primary/10 text-primary'}`}>
                        <Monitor className="w-5 h-5" />
                      </div>
                      {isOccupied && (
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-destructive/10 text-destructive">
                          In Use
                        </span>
                      )}
                    </div>
                    
                    <h3 className={`text-xl font-semibold tracking-tight mb-1 ${isOccupied ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {counter.name}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-4">
                      {service?.name || 'Unknown Service'}
                    </p>

                    {counter.currentNumber ? (
                      <div className="pt-4 border-t border-border/40">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Currently Serving</p>
                        <p className={`text-2xl font-bold tracking-tighter ${isOccupied ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {counter.currentNumber}
                        </p>
                      </div>
                    ) : (
                       <div className="pt-4 border-t border-border/40">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 opacity-0">Placeholder</p>
                        <p className="text-sm font-medium text-muted-foreground/50">
                          Idle
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
