import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface Service {
  id: string;
  name: string;
  prefix: string;
  color: string;
}

export interface Counter {
  id: string;
  name: string;
  serviceId: string;
  staffId?: string;
  currentNumber?: string;
  status: 'active' | 'inactive';
}

export interface QueueItem {
  id: string;
  number: string;
  serviceId: string;
  status: 'waiting' | 'serving' | 'completed' | 'skipped';
  priority: boolean;
  counterId?: string;
  timestamp: number;
  calledAt?: number;
  completedAt?: number;
  staffId?: string;
}

export interface Staff {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'staff' | 'admin';
  serviceId?: string;
}

interface StaffStats {
  staffId: string;
  name: string;
  served: number;
  avgServiceTime: number; // in minutes
}

interface ServiceStats {
  serviceId: string;
  name: string;
  totalToday: number;
  completed: number;
  waiting: number;
  serving: number;
  skipped: number;
  avgServiceTime: number;
  completionRate: number;
}

interface QueueContextType {
  services: Service[];
  counters: Counter[];
  queue: QueueItem[];
  staff: Staff[];
  currentUser: Staff | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  addToQueue: (serviceId: string, priority?: boolean) => QueueItem;
  callNext: (counterId: string) => QueueItem | null;
  finishService: (counterId: string) => void;
  skipNumber: (counterId: string) => void;
  recallNumber: (number: string, counterId: string) => void;
  login: (username: string, password: string) => Staff | null;
  logout: () => void;
  assignCounter: (counterId: string, staffId: string) => void;
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  addCounter: (counter: Omit<Counter, 'id'>) => void;
  updateCounter: (id: string, counter: Partial<Counter>) => void;
  deleteCounter: (id: string) => void;
  addStaff: (staff: Omit<Staff, 'id'>) => void;
  updateStaff: (id: string, staff: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
  resetQueue: () => void;
  getQueueStats: () => {
    totalToday: number;
    completed: number;
    waiting: number;
    serving: number;
    averageTime: number;
  };
  getEstimatedWaitTime: (serviceId: string) => number; // in minutes
  getServiceStats: () => ServiceStats[];
  getStaffStats: () => StaffStats[];
  exportQueueCSV: () => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

const defaultServices: Service[] = [
  { id: '1', name: 'Cashier', prefix: 'C', color: '#3b82f6' },
  { id: '2', name: 'Registrar', prefix: 'R', color: '#10b981' },
  { id: '3', name: 'Inquiry', prefix: 'I', color: '#f59e0b' },
  { id: '4', name: 'Consultation', prefix: 'S', color: '#8b5cf6' },
];

const defaultCounters: Counter[] = [
  { id: '1', name: 'Cashier Window 1', serviceId: '1', status: 'inactive' },
  { id: '2', name: 'Cashier Window 2', serviceId: '1', status: 'inactive' },
  { id: '3', name: 'Registrar Window 1', serviceId: '2', status: 'inactive' },
  { id: '4', name: 'Inquiry Window 1', serviceId: '3', status: 'inactive' },
  { id: '5', name: 'Consultation Room 1', serviceId: '4', status: 'inactive' },
];

const defaultStaff: Staff[] = [
  { id: '1', username: 'admin', password: 'admin123', name: 'System Admin', role: 'admin' },
  { id: '2', username: 'cashier1', password: 'cash123', name: 'John Doe', role: 'staff', serviceId: '1' },
  { id: '3', username: 'registrar1', password: 'reg123', name: 'Jane Smith', role: 'staff', serviceId: '2' },
];

export const QueueProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('qms_services');
    return saved ? JSON.parse(saved) : defaultServices;
  });

  const [counters, setCounters] = useState<Counter[]>(() => {
    const saved = localStorage.getItem('qms_counters');
    return saved ? JSON.parse(saved) : defaultCounters;
  });

  const [queue, setQueue] = useState<QueueItem[]>(() => {
    const saved = localStorage.getItem('qms_queue');
    return saved ? JSON.parse(saved) : [];
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('qms_staff');
    return saved ? JSON.parse(saved) : defaultStaff;
  });

  const [currentUser, setCurrentUser] = useState<Staff | null>(() => {
    const saved = localStorage.getItem('qms_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('qms_theme') as 'light' | 'dark') || 'light';
  });

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('qms_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => { localStorage.setItem('qms_services', JSON.stringify(services)); }, [services]);
  useEffect(() => { localStorage.setItem('qms_counters', JSON.stringify(counters)); }, [counters]);
  useEffect(() => { localStorage.setItem('qms_queue', JSON.stringify(queue)); }, [queue]);
  useEffect(() => { localStorage.setItem('qms_staff', JSON.stringify(staff)); }, [staff]);
  useEffect(() => { localStorage.setItem('qms_current_user', JSON.stringify(currentUser)); }, [currentUser]);

  const addToQueue = (serviceId: string, priority = false): QueueItem => {
    const service = services.find(s => s.id === serviceId);
    if (!service) throw new Error('Service not found');

    const today = new Date().toDateString();
    const todayQueue = queue.filter(q =>
      new Date(q.timestamp).toDateString() === today &&
      q.serviceId === serviceId
    );

    const nextNumber = todayQueue.length + 1;
    const number = `${priority ? '⚡' : ''}${service.prefix}${String(nextNumber).padStart(3, '0')}`;

    const newItem: QueueItem = {
      id: Date.now().toString(),
      number,
      serviceId,
      status: 'waiting',
      priority,
      timestamp: Date.now(),
    };

    setQueue(prev => [...prev, newItem]);
    return newItem;
  };

  const callNext = (counterId: string): QueueItem | null => {
    const counter = counters.find(c => c.id === counterId);
    if (!counter) return null;

    // Finish current serving item if any
    if (counter.currentNumber) {
      setQueue(prev => prev.map(q =>
        q.number === counter.currentNumber && q.status === 'serving'
          ? { ...q, status: 'completed', completedAt: Date.now() }
          : q
      ));
    }

    // Priority tickets first, then by timestamp
    const nextItem = queue
      .filter(q => q.serviceId === counter.serviceId && q.status === 'waiting')
      .sort((a, b) => {
        if (a.priority && !b.priority) return -1;
        if (!a.priority && b.priority) return 1;
        return a.timestamp - b.timestamp;
      })[0];

    if (!nextItem) {
      setCounters(prev => prev.map(c => c.id === counterId ? { ...c, currentNumber: undefined } : c));
      return null;
    }

    const staffId = currentUser?.id;
    setQueue(prev => prev.map(q =>
      q.id === nextItem.id
        ? { ...q, status: 'serving', counterId, calledAt: Date.now(), staffId }
        : q
    ));

    setCounters(prev => prev.map(c =>
      c.id === counterId
        ? { ...c, currentNumber: nextItem.number, status: 'active', staffId }
        : c
    ));

    return { ...nextItem, status: 'serving', counterId, calledAt: Date.now() };
  };

  const finishService = (counterId: string) => {
    const counter = counters.find(c => c.id === counterId);
    if (!counter?.currentNumber) return;

    setQueue(prev => prev.map(q =>
      q.number === counter.currentNumber && q.status === 'serving'
        ? { ...q, status: 'completed', completedAt: Date.now() }
        : q
    ));

    setCounters(prev => prev.map(c =>
      c.id === counterId ? { ...c, currentNumber: undefined } : c
    ));
  };

  const skipNumber = (counterId: string) => {
    const counter = counters.find(c => c.id === counterId);
    if (!counter?.currentNumber) return;

    setQueue(prev => prev.map(q =>
      q.number === counter.currentNumber
        ? { ...q, status: 'skipped', counterId: undefined }
        : q
    ));

    setCounters(prev => prev.map(c =>
      c.id === counterId ? { ...c, currentNumber: undefined } : c
    ));
  };

  const recallNumber = (number: string, counterId: string) => {
    const counter = counters.find(c => c.id === counterId);
    if (!counter) return;

    setQueue(prev => prev.map(q =>
      q.number === number
        ? { ...q, status: 'serving', counterId, calledAt: Date.now() }
        : q
    ));

    setCounters(prev => prev.map(c =>
      c.id === counterId ? { ...c, currentNumber: number, status: 'active' } : c
    ));
  };

  const login = (username: string, password: string): Staff | null => {
    const user = staff.find(s => s.username === username && s.password === password);
    if (user) { setCurrentUser(user); return user; }
    return null;
  };

  const logout = () => setCurrentUser(null);

  const assignCounter = (counterId: string, staffId: string) => {
    setCounters(prev => prev.map(c =>
      c.id === counterId ? { ...c, staffId, status: 'active' } : c
    ));
  };

  const addService = (service: Omit<Service, 'id'>) => {
    setServices(prev => [...prev, { ...service, id: Date.now().toString() }]);
  };
  const updateService = (id: string, service: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...service } : s));
  };
  const deleteService = (id: string) => setServices(prev => prev.filter(s => s.id !== id));

  const addCounter = (counter: Omit<Counter, 'id'>) => {
    setCounters(prev => [...prev, { ...counter, id: Date.now().toString() }]);
  };
  const updateCounter = (id: string, counter: Partial<Counter>) => {
    setCounters(prev => prev.map(c => c.id === id ? { ...c, ...counter } : c));
  };
  const deleteCounter = (id: string) => setCounters(prev => prev.filter(c => c.id !== id));

  const addStaff = (newStaff: Omit<Staff, 'id'>) => {
    setStaff(prev => [...prev, { ...newStaff, id: Date.now().toString() }]);
  };
  const updateStaff = (id: string, updates: Partial<Staff>) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };
  const deleteStaff = (id: string) => setStaff(prev => prev.filter(s => s.id !== id));

  const resetQueue = () => {
    setQueue([]);
    setCounters(prev => prev.map(c => ({ ...c, currentNumber: undefined, status: 'inactive' })));
  };

  const getQueueStats = () => {
    const today = new Date().toDateString();
    const todayQueue = queue.filter(q => new Date(q.timestamp).toDateString() === today);
    const completed = todayQueue.filter(q => q.status === 'completed');
    const totalTime = completed.reduce((sum, q) => {
      if (q.calledAt && q.completedAt) return sum + (q.completedAt - q.calledAt);
      return sum;
    }, 0);
    return {
      totalToday: todayQueue.length,
      completed: completed.length,
      waiting: todayQueue.filter(q => q.status === 'waiting').length,
      serving: todayQueue.filter(q => q.status === 'serving').length,
      averageTime: completed.length > 0 ? totalTime / completed.length / 1000 / 60 : 0,
    };
  };

  const getEstimatedWaitTime = (serviceId: string): number => {
    const today = new Date().toDateString();
    const todayQueue = queue.filter(q => new Date(q.timestamp).toDateString() === today && q.serviceId === serviceId);
    const completed = todayQueue.filter(q => q.status === 'completed' && q.calledAt && q.completedAt);
    const avgServiceTime = completed.length > 0
      ? completed.reduce((sum, q) => sum + (q.completedAt! - q.calledAt!), 0) / completed.length / 1000 / 60
      : 3; // fallback 3 min average
    const waitingCount = todayQueue.filter(q => q.status === 'waiting').length;
    const activeCounterCount = Math.max(1, counters.filter(c => c.serviceId === serviceId && c.status === 'active').length);
    return Math.ceil((waitingCount / activeCounterCount) * avgServiceTime);
  };

  const getServiceStats = (): ServiceStats[] => {
    const today = new Date().toDateString();
    return services.map(service => {
      const todayQueue = queue.filter(q =>
        new Date(q.timestamp).toDateString() === today && q.serviceId === service.id
      );
      const completed = todayQueue.filter(q => q.status === 'completed');
      const avgTime = completed.length > 0
        ? completed.reduce((sum, q) => {
          return q.calledAt && q.completedAt ? sum + (q.completedAt - q.calledAt) : sum;
        }, 0) / completed.length / 1000 / 60
        : 0;
      return {
        serviceId: service.id,
        name: service.name,
        totalToday: todayQueue.length,
        completed: completed.length,
        waiting: todayQueue.filter(q => q.status === 'waiting').length,
        serving: todayQueue.filter(q => q.status === 'serving').length,
        skipped: todayQueue.filter(q => q.status === 'skipped').length,
        avgServiceTime: parseFloat(avgTime.toFixed(1)),
        completionRate: todayQueue.length > 0 ? Math.round((completed.length / todayQueue.length) * 100) : 0,
      };
    });
  };

  const getStaffStats = (): StaffStats[] => {
    const today = new Date().toDateString();
    return staff.map(member => {
      const servedItems = queue.filter(q =>
        new Date(q.timestamp).toDateString() === today &&
        q.staffId === member.id &&
        q.status === 'completed' &&
        q.calledAt && q.completedAt
      );
      const avgTime = servedItems.length > 0
        ? servedItems.reduce((sum, q) => sum + (q.completedAt! - q.calledAt!), 0) / servedItems.length / 1000 / 60
        : 0;
      return {
        staffId: member.id,
        name: member.name,
        served: servedItems.length,
        avgServiceTime: parseFloat(avgTime.toFixed(1)),
      };
    });
  };

  const exportQueueCSV = () => {
    const today = new Date().toDateString();
    const todayQueue = queue.filter(q => new Date(q.timestamp).toDateString() === today);
    const headers = ['Ticket Number', 'Service', 'Priority', 'Status', 'Issued At', 'Called At', 'Completed At', 'Service Time (min)', 'Counter', 'Staff'];
    const rows = todayQueue.map(item => {
      const service = services.find(s => s.id === item.serviceId);
      const counter = counters.find(c => c.id === item.counterId);
      const staffMember = staff.find(s => s.id === item.staffId);
      const serviceTime = item.calledAt && item.completedAt
        ? ((item.completedAt - item.calledAt) / 1000 / 60).toFixed(1)
        : '';
      return [
        item.number,
        service?.name || '',
        item.priority ? 'Yes' : 'No',
        item.status,
        new Date(item.timestamp).toLocaleTimeString(),
        item.calledAt ? new Date(item.calledAt).toLocaleTimeString() : '',
        item.completedAt ? new Date(item.completedAt).toLocaleTimeString() : '',
        serviceTime,
        counter?.name || '',
        staffMember?.name || '',
      ];
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `queue-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <QueueContext.Provider
      value={{
        services, counters, queue, staff, currentUser,
        theme, toggleTheme,
        addToQueue, callNext, finishService, skipNumber, recallNumber,
        login, logout, assignCounter,
        addService, updateService, deleteService,
        addCounter, updateCounter, deleteCounter,
        addStaff, updateStaff, deleteStaff,
        resetQueue, getQueueStats,
        getEstimatedWaitTime, getServiceStats, getStaffStats,
        exportQueueCSV,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) throw new Error('useQueue must be used within QueueProvider');
  return context;
};
