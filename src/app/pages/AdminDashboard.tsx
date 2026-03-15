import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQueue } from '../context/QueueContext';
import {
  LayoutDashboard, Settings, Users, Monitor, LogOut, BarChart3,
  Plus, Edit, Trash2, RefreshCw, CheckCircle, Clock, TrendingUp,
  UserCircle, Moon, Sun, Download, X, Save
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type TabType = 'overview' | 'services' | 'counters' | 'staff' | 'analytics' | 'reports';

// ─── Generic Form Modal ───────────────────────────────────────────────────────
const Modal: React.FC<{ title: string; onClose: () => void; onSave: () => void; children: React.ReactNode }> = ({
  title, onClose, onSave, children
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-card text-foreground rounded-2xl shadow-2xl border border-border/60 w-full max-w-md z-10">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
        <h3 className="text-lg font-bold tracking-tight">{title}</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
      </div>
      <div className="p-6 space-y-4">{children}</div>
      <div className="flex gap-2 px-6 pb-6">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground hover:bg-muted text-sm font-medium transition-colors">Cancel</button>
        <button onClick={onSave} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> Save
        </button>
      </div>
    </div>
  </div>
);

const FieldInput: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }> = ({
  label, value, onChange, placeholder, type = 'text'
}) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-foreground">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    />
  </div>
);

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser, logout, services, counters, staff, queue,
    addService, updateService, deleteService,
    addCounter, updateCounter, deleteCounter,
    addStaff, updateStaff, deleteStaff,
    resetQueue, getQueueStats, getServiceStats, getStaffStats,
    exportQueueCSV, theme, toggleTheme
  } = useQueue();

  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Modal state
  type ModalMode = { type: 'service' | 'counter' | 'staff'; editId?: string } | null;
  const [modal, setModal] = useState<ModalMode>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formPrefix, setFormPrefix] = useState('');
  const [formColor, setFormColor] = useState('#3b82f6');
  const [formServiceId, setFormServiceId] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('inactive');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<'staff' | 'admin'>('staff');

  React.useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') navigate('/staff-login');
  }, [currentUser, navigate]);

  const stats = getQueueStats();
  const serviceStats = getServiceStats();
  const staffStats = getStaffStats();

  const openModal = (type: 'service' | 'counter' | 'staff', editId?: string) => {
    setModal({ type, editId });
    if (type === 'service') {
      const existing = editId ? services.find(s => s.id === editId) : null;
      setFormName(existing?.name || '');
      setFormPrefix(existing?.prefix || '');
      setFormColor(existing?.color || '#3b82f6');
    } else if (type === 'counter') {
      const existing = editId ? counters.find(c => c.id === editId) : null;
      setFormName(existing?.name || '');
      setFormServiceId(existing?.serviceId || services[0]?.id || '');
      setFormStatus(existing?.status || 'inactive');
    } else {
      const existing = editId ? staff.find(s => s.id === editId) : null;
      setFormName(existing?.name || '');
      setFormUsername(existing?.username || '');
      setFormPassword(existing?.password || '');
      setFormRole(existing?.role || 'staff');
      setFormServiceId(existing?.serviceId || '');
    }
  };

  const handleSave = () => {
    if (!modal) return;
    if (modal.type === 'service') {
      if (!formName || !formPrefix) return;
      if (modal.editId) updateService(modal.editId, { name: formName, prefix: formPrefix, color: formColor });
      else addService({ name: formName, prefix: formPrefix, color: formColor });
    } else if (modal.type === 'counter') {
      if (!formName || !formServiceId) return;
      if (modal.editId) updateCounter(modal.editId, { name: formName, serviceId: formServiceId, status: formStatus });
      else addCounter({ name: formName, serviceId: formServiceId, status: formStatus });
    } else {
      if (!formName || !formUsername || !formPassword) return;
      const staffData = { name: formName, username: formUsername, password: formPassword, role: formRole, serviceId: formServiceId || undefined };
      if (modal.editId) updateStaff(modal.editId, staffData);
      else addStaff(staffData);
    }
    setModal(null);
  };

  const handleLogout = () => { logout(); navigate('/staff-login'); };
  const handleResetQueue = () => {
    if (confirm('Reset all queues? This will clear all current queue numbers.')) resetQueue();
  };

  if (!currentUser) return null;

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'services', label: 'Services', icon: Settings },
    { id: 'counters', label: 'Counters', icon: Monitor },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="bg-card shadow-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <LayoutDashboard className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground text-sm">Queue Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-muted-foreground">Logged in as</p>
                <p className="font-semibold text-foreground">{currentUser.name}</p>
              </div>
              <button onClick={toggleTheme} className="p-2.5 rounded-lg border border-border hover:bg-muted transition-colors" title="Toggle dark mode">
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-foreground" />}
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 font-semibold transition-colors relative text-sm whitespace-nowrap ${activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: 'Total Today', value: stats.totalToday, color: 'text-blue-600', icon: Users },
                { label: 'Waiting', value: stats.waiting, color: 'text-orange-600', icon: Clock },
                { label: 'Serving', value: stats.serving, color: 'text-purple-600', icon: TrendingUp },
                { label: 'Completed', value: stats.completed, color: 'text-green-600', icon: CheckCircle },
                { label: 'Avg Time (min)', value: stats.averageTime.toFixed(1), color: 'text-indigo-600', icon: Clock },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="bg-card rounded-xl shadow-sm border border-border/40 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <p className="text-muted-foreground font-medium text-sm">{label}</p>
                  </div>
                  <p className={`text-3xl font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-xl shadow-sm border border-border/40 p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => navigate('/display')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm font-medium">
                  <Monitor className="w-4 h-4" /> View Display
                </button>
                <button onClick={handleResetQueue} className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm font-medium">
                  <RefreshCw className="w-4 h-4" /> Reset Queue
                </button>
                <button onClick={() => navigate('/')} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm font-medium">
                  <Users className="w-4 h-4" /> Customer Kiosk
                </button>
                <button onClick={exportQueueCSV} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm font-medium">
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>
            </div>

            {/* Active Counters */}
            <div className="bg-card rounded-xl shadow-sm border border-border/40 p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Active Counters</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {counters.filter(c => c.currentNumber).map(counter => {
                  const service = services.find(s => s.id === counter.serviceId);
                  const staffMember = staff.find(s => s.id === counter.staffId);
                  return (
                    <div key={counter.id} className="border-2 rounded-xl p-4" style={{ borderColor: service?.color }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-foreground">{counter.name}</p>
                        <span className="px-2 py-0.5 rounded text-xs font-bold text-white" style={{ backgroundColor: service?.color }}>{service?.name}</span>
                      </div>
                      <p className="text-3xl font-bold mb-1" style={{ color: service?.color }}>{counter.currentNumber}</p>
                      {staffMember && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <UserCircle className="w-4 h-4" />{staffMember.name}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              {counters.filter(c => c.currentNumber).length === 0 && (
                <p className="text-center text-muted-foreground py-8">No active counters</p>
              )}
            </div>
          </>
        )}

        {/* SERVICES */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Services Management</h2>
              <button onClick={() => openModal('service')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" /> Add Service
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(service => (
                <div key={service.id} className="bg-card rounded-xl shadow-sm border border-border/40 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white" style={{ backgroundColor: service.color }}>
                      {service.prefix}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openModal('service', service.id)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => { if (confirm(`Delete ${service.name}?`)) deleteService(service.id); }} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{service.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Prefix: <span className="font-mono font-bold">{service.prefix}</span></p>
                  <p className="text-sm text-muted-foreground">{counters.filter(c => c.serviceId === service.id).length} counter(s)</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COUNTERS */}
        {activeTab === 'counters' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Counters Management</h2>
              <button onClick={() => openModal('counter')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" /> Add Counter
              </button>
            </div>
            <div className="bg-card rounded-xl shadow-sm border border-border/40 overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    {['Counter Name', 'Service', 'Status', 'Current', 'Actions'].map(h => (
                      <th key={h} className={`px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {counters.map(counter => {
                    const service = services.find(s => s.id === counter.serviceId);
                    return (
                      <tr key={counter.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-semibold text-foreground">{counter.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: service?.color }}>{service?.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${counter.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>{counter.status}</span>
                        </td>
                        <td className="px-6 py-4 font-bold" style={{ color: service?.color }}>{counter.currentNumber || '—'}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => openModal('counter', counter.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors inline-flex mr-1"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => { if (confirm(`Delete ${counter.name}?`)) deleteCounter(counter.id); }} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors inline-flex"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STAFF */}
        {activeTab === 'staff' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Staff Management</h2>
              <button onClick={() => openModal('staff')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" /> Add Staff
              </button>
            </div>
            <div className="bg-card rounded-xl shadow-sm border border-border/40 overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    {['Name', 'Username', 'Role', 'Service', 'Actions'].map(h => (
                      <th key={h} className={`px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {staff.map(member => {
                    const service = services.find(s => s.id === member.serviceId);
                    return (
                      <tr key={member.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-semibold text-foreground">{member.name}</td>
                        <td className="px-6 py-4 text-muted-foreground font-mono text-sm">{member.username}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${member.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>{member.role}</span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{service?.name || '—'}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => openModal('staff', member.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg inline-flex mr-1"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => { if (confirm(`Delete ${member.name}?`)) deleteStaff(member.id); }} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg inline-flex"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Analytics</h2>

            {/* Volume Chart */}
            <div className="bg-card rounded-xl shadow-sm border border-border/40 p-6">
              <h3 className="text-lg font-bold text-foreground mb-6">Tickets by Service (Today)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={serviceStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)', fontSize: '13px' }} />
                  <Bar dataKey="totalToday" name="Total" radius={[6, 6, 0, 0]}>
                    {serviceStats.map((entry) => {
                      const svc = services.find(s => s.id === entry.serviceId);
                      return <Cell key={entry.serviceId} fill={svc?.color || '#3b82f6'} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Completion Chart */}
            <div className="bg-card rounded-xl shadow-sm border border-border/40 p-6">
              <h3 className="text-lg font-bold text-foreground mb-6">Completion Rate by Service</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={serviceStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)', fontSize: '13px' }} formatter={(v) => [`${v}%`, 'Completion Rate']} />
                  <Bar dataKey="completionRate" name="Completion %" radius={[6, 6, 0, 0]}>
                    {serviceStats.map((entry) => {
                      const svc = services.find(s => s.id === entry.serviceId);
                      return <Cell key={entry.serviceId} fill={svc?.color || '#10b981'} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Service Details Table */}
            <div className="bg-card rounded-xl shadow-sm border border-border/40 overflow-hidden">
              <div className="px-6 py-4 border-b border-border/40">
                <h3 className="text-lg font-bold text-foreground">Service Breakdown</h3>
              </div>
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    {['Service', 'Total', 'Completed', 'Waiting', 'Skipped', 'Avg Time', 'Rate'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {serviceStats.map(s => {
                    const svc = services.find(sv => sv.id === s.serviceId);
                    return (
                      <tr key={s.serviceId} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: svc?.color }}></div>
                            <span className="font-semibold text-foreground text-sm">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-foreground text-sm font-medium">{s.totalToday}</td>
                        <td className="px-5 py-3 text-green-600 text-sm font-medium">{s.completed}</td>
                        <td className="px-5 py-3 text-orange-600 text-sm font-medium">{s.waiting}</td>
                        <td className="px-5 py-3 text-muted-foreground text-sm">{s.skipped}</td>
                        <td className="px-5 py-3 text-muted-foreground text-sm">{s.avgServiceTime > 0 ? `${s.avgServiceTime}m` : '—'}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.completionRate >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : s.completionRate >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-muted text-muted-foreground'}`}>
                            {s.completionRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Reports & Performance</h2>
              <button onClick={exportQueueCSV} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>

            {/* Today Summary */}
            <div className="bg-card rounded-xl shadow-sm border border-border/40 p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Today's Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Issued', value: stats.totalToday, color: 'text-blue-600' },
                  { label: 'Completed', value: stats.completed, color: 'text-green-600' },
                  { label: 'Waiting', value: stats.waiting, color: 'text-orange-600' },
                  { label: 'Avg Time (min)', value: stats.averageTime.toFixed(1), color: 'text-indigo-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">{label}</p>
                    <p className={`text-4xl font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Staff Performance */}
            <div className="bg-card rounded-xl shadow-sm border border-border/40 overflow-hidden">
              <div className="px-6 py-4 border-b border-border/40">
                <h3 className="text-lg font-bold text-foreground">Staff Performance (Today)</h3>
              </div>
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    {['Staff Member', 'Customers Served', 'Avg Service Time', 'Performance'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {staffStats.map(s => (
                    <tr key={s.staffId} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <UserCircle className="w-5 h-5 text-muted-foreground" />
                          <span className="font-semibold text-foreground">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-foreground font-bold">{s.served}</td>
                      <td className="px-6 py-4 text-muted-foreground">{s.avgServiceTime > 0 ? `${s.avgServiceTime} min` : '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 bg-muted rounded-full max-w-[120px]">
                            <div
                              className="h-2 rounded-full bg-blue-500"
                              style={{ width: `${Math.min((s.served / Math.max(...staffStats.map(s2 => s2.served), 1)) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{s.served} served</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Queue History Log */}
            <div className="bg-card rounded-xl shadow-sm border border-border/40 overflow-hidden">
              <div className="px-6 py-4 border-b border-border/40">
                <h3 className="text-lg font-bold text-foreground">Today's Queue Log</h3>
              </div>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      {['Ticket', 'Service', 'Priority', 'Status', 'Issued', 'Called', 'Completed', 'Duration'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {queue
                      .filter(q => new Date(q.timestamp).toDateString() === new Date().toDateString())
                      .sort((a, b) => b.timestamp - a.timestamp)
                      .map(item => {
                        const svc = services.find(s => s.id === item.serviceId);
                        const duration = item.calledAt && item.completedAt
                          ? `${((item.completedAt - item.calledAt) / 1000 / 60).toFixed(1)}m`
                          : '—';
                        return (
                          <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 font-bold text-foreground text-sm">{item.number}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: svc?.color }}>{svc?.name}</span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {item.priority ? <span className="text-amber-600 font-semibold text-xs">⚡ Yes</span> : <span className="text-muted-foreground text-xs">No</span>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                item.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                item.status === 'serving' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                item.status === 'skipped' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                                'bg-muted text-muted-foreground'
                              }`}>{item.status}</span>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{item.calledAt ? new Date(item.calledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{item.completedAt ? new Date(item.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{duration}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CRUD Modals */}
      {modal?.type === 'service' && (
        <Modal title={modal.editId ? 'Edit Service' : 'Add Service'} onClose={() => setModal(null)} onSave={handleSave}>
          <FieldInput label="Service Name" value={formName} onChange={setFormName} placeholder="e.g. Cashier" />
          <FieldInput label="Prefix (1-2 chars)" value={formPrefix} onChange={v => setFormPrefix(v.toUpperCase().slice(0, 2))} placeholder="e.g. C" />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={formColor} onChange={e => setFormColor(e.target.value)} className="w-12 h-10 rounded-lg border border-input cursor-pointer" />
              <span className="text-sm font-mono text-muted-foreground">{formColor}</span>
            </div>
          </div>
        </Modal>
      )}

      {modal?.type === 'counter' && (
        <Modal title={modal.editId ? 'Edit Counter' : 'Add Counter'} onClose={() => setModal(null)} onSave={handleSave}>
          <FieldInput label="Counter Name" value={formName} onChange={setFormName} placeholder="e.g. Window 1" />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Service</label>
            <select value={formServiceId} onChange={e => setFormServiceId(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Status</label>
            <select value={formStatus} onChange={e => setFormStatus(e.target.value as 'active' | 'inactive')}
              className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <option value="inactive">Inactive</option>
              <option value="active">Active</option>
            </select>
          </div>
        </Modal>
      )}

      {modal?.type === 'staff' && (
        <Modal title={modal.editId ? 'Edit Staff' : 'Add Staff'} onClose={() => setModal(null)} onSave={handleSave}>
          <FieldInput label="Full Name" value={formName} onChange={setFormName} placeholder="e.g. Jane Smith" />
          <FieldInput label="Username" value={formUsername} onChange={setFormUsername} placeholder="e.g. jane.smith" />
          <FieldInput label="Password" value={formPassword} onChange={setFormPassword} placeholder="••••••••" type="password" />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Role</label>
            <select value={formRole} onChange={e => setFormRole(e.target.value as 'staff' | 'admin')}
              className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Assigned Service (optional)</label>
            <select value={formServiceId} onChange={e => setFormServiceId(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <option value="">— None —</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
};
