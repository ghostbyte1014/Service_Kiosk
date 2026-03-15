import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Ticket, Monitor, Users, ShieldCheck, BarChart3,
  ChevronDown, ChevronUp, ArrowRight, Building2,
  PhoneCall, CheckCircle, Zap, QrCode, Volume2,
  Moon, Download, Clock, SkipForward
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ── Types ────────────────────────────────────────────────────────────────────
interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

interface Role {
  id: string;
  label: string;
  icon: React.ElementType;
  gradient: string;
  ring: string;
  steps: Step[];
}

interface FAQItem {
  question: string;
  answer: string;
}

// ── Data ─────────────────────────────────────────────────────────────────────
const roles: Role[] = [
  {
    id: 'customer',
    label: 'Customer',
    icon: Users,
    gradient: 'from-blue-500 to-cyan-500',
    ring: 'ring-blue-400/30',
    steps: [
      { number: 1, title: 'Visit the Kiosk', description: 'Walk up to the self-service kiosk screen and browse the available services offered today.', icon: Building2, color: 'text-blue-600' },
      { number: 2, title: 'Select Your Service', description: 'Tap the service you need. If you\'re a senior citizen or PWD, tap the ⚡ Priority button for a faster lane.', icon: Zap, color: 'text-amber-600' },
      { number: 3, title: 'Get Your Ticket', description: 'A unique queue number is generated instantly (e.g., C001). Your estimated wait time is shown on screen.', icon: Ticket, color: 'text-green-600' },
      { number: 4, title: 'Scan QR or Wait', description: 'Scan the QR code on your ticket to track your position live on your phone. Watch the display screen for your number.', icon: QrCode, color: 'text-purple-600' },
      { number: 5, title: 'Proceed When Called', description: 'When your number appears on the display and is announced by voice, proceed to the specified counter.', icon: CheckCircle, color: 'text-teal-600' },
    ],
  },
  {
    id: 'staff',
    label: 'Counter Staff',
    icon: ShieldCheck,
    gradient: 'from-emerald-500 to-green-600',
    ring: 'ring-emerald-400/30',
    steps: [
      { number: 1, title: 'Login', description: 'Sign in at /staff-login with your assigned credentials to access the staff area.', icon: ShieldCheck, color: 'text-emerald-600' },
      { number: 2, title: 'Select Your Counter', description: 'Choose the counter you\'ll be operating. Each counter is tied to a specific service type.', icon: Monitor, color: 'text-blue-600' },
      { number: 3, title: 'Call Next Customer', description: 'Click "Call Next Customer" — a chime plays, the number appears on the public display, and a voice announcement is made.', icon: PhoneCall, color: 'text-indigo-600' },
      { number: 4, title: 'Serve the Customer', description: 'A live timer tracks service duration. You can see priority (⚡) tickets and their ETA in the waiting list.', icon: Clock, color: 'text-orange-600' },
      { number: 5, title: 'Finish, Skip, or Recall', description: 'Click "Finish" to complete the service. Skip absent customers (you can recall them later). Session stats update automatically.', icon: SkipForward, color: 'text-purple-600' },
    ],
  },
  {
    id: 'admin',
    label: 'Administrator',
    icon: BarChart3,
    gradient: 'from-violet-500 to-purple-600',
    ring: 'ring-violet-400/30',
    steps: [
      { number: 1, title: 'Login as Admin', description: 'Sign in with admin credentials. Only admin-role accounts can access the Admin Dashboard.', icon: ShieldCheck, color: 'text-violet-600' },
      { number: 2, title: 'Manage Services & Counters', description: 'Add, edit, or delete services (with custom colors/prefixes) and counters. Assign counters to service types.', icon: Building2, color: 'text-blue-600' },
      { number: 3, title: 'Manage Staff Accounts', description: 'Create staff accounts, assign roles (Staff or Admin), and link them to the services they are responsible for.', icon: Users, color: 'text-emerald-600' },
      { number: 4, title: 'Monitor in Real-Time', description: 'The Overview tab shows live stats: total tickets, waiting, serving, completed, and average service time.', icon: BarChart3, color: 'text-orange-600' },
      { number: 5, title: 'Analytics & Reports', description: 'View bar charts by service, staff performance leaderboards, the full queue history log, and toggle Dark Mode.', icon: Download, color: 'text-indigo-600' },
    ],
  },
];

const features = [
  { icon: Zap, title: 'Priority Queue', description: 'Senior Citizens & PWDs get an express lane with automatic priority sorting.', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { icon: Clock, title: 'Wait Time Estimates', description: 'Smart ETA calculation based on live queue depth and historical service speed.', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { icon: Volume2, title: 'Voice Announcements', description: 'Browser-based Text-to-Speech calls each number aloud on the public display.', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { icon: Monitor, title: 'TV Display Mode', description: 'Maximized, high-contrast display mode optimized for large lobby screens.', color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20' },
  { icon: QrCode, title: 'QR Code Tracking', description: 'Customers scan their ticket QR code for a live mobile view of their queue position.', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { icon: BarChart3, title: 'Analytics Dashboard', description: 'Visual charts for ticket volume, completion rates, and staff performance metrics.', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  { icon: Download, title: 'CSV Export', description: 'One-click export of the full daily queue log with all timestamps and durations.', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  { icon: Moon, title: 'Dark Mode', description: 'Persistent dark/light theme toggle for comfortable use in any lighting condition.', color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-800/40' },
];

const faqs: FAQItem[] = [
  { question: 'How are priority tickets handled?', answer: 'Priority tickets (issued by tapping the ⚡ Priority button) are always sorted to the front of the queue ahead of standard tickets of the same service type. They are clearly marked in the counter dashboard with a ⚡ badge.' },
  { question: 'How is the estimated wait time calculated?', answer: 'The system calculates the average service duration from completed tickets of the same service type and multiplies it by the number of people waiting divided by the number of active counters.' },
  { question: 'What happens when a customer is skipped?', answer: 'Skipped tickets move to a separate "Skipped" list on the counter dashboard. Staff can recall a skipped number at any time, which re-announces the number and moves it back to "Serving" status.' },
  { question: 'How does the QR code tracker work?', answer: 'Each generated ticket includes a QR code linking to /track/:id. When scanned, it shows the customer\'s live queue position, estimated wait, and the number currently being served — all updated every few seconds from local state.' },
  { question: 'Can I export the day\'s data?', answer: 'Yes. Go to Admin Dashboard → Reports tab (or the Export CSV button on the Overview tab) to download a CSV file containing all tickets issued today, including service type, priority, status, timestamps, assigned counter, and staff.' },
  { question: 'Where is the data stored?', answer: 'All data is stored in your browser\'s localStorage. This means it persists between page refreshes but is local to the device. For a production deployment, replace localStorage with a real backend API and database.' },
];

// ── Components ────────────────────────────────────────────────────────────────
const FAQAccordion: React.FC<{ faq: FAQItem; index: number }> = ({ faq, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border/60 rounded-2xl overflow-hidden bg-card">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between p-5 lg:p-6 text-left gap-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
            {index + 1}
          </span>
          <span className="font-semibold text-foreground text-sm lg:text-base">{faq.question}</span>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-5 lg:px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────
export const HowItWorks: React.FC = () => {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState('customer');
  const currentRole = roles.find(r => r.id === activeRole)!;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground font-sans">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-blue-500/5 border-b border-border/40">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 py-16 lg:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
            Documentation
          </div>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-foreground mb-4 leading-tight">
            How It Works
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            A complete walkthrough of the Queue Management System — from getting a ticket to managing service analytics.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Ticket className="w-5 h-5" /> Get a Ticket
            </button>
            <button
              onClick={() => navigate('/display')}
              className="inline-flex items-center gap-2 px-6 py-3 border border-border bg-card rounded-xl font-semibold hover:bg-muted/50 transition-colors"
            >
              <Monitor className="w-5 h-5" /> View Display
            </button>
            <button
              onClick={() => navigate('/staff-login')}
              className="inline-flex items-center gap-2 px-6 py-3 border border-border bg-card rounded-xl font-semibold hover:bg-muted/50 transition-colors"
            >
              <ShieldCheck className="w-5 h-5" /> Staff Login
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16 space-y-20">

        {/* ── System Overview ── */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3">System Overview</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Three interfaces serve three distinct user groups — all connected through a shared real-time queue state.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Ticket, title: 'Kiosk', description: 'Self-service ticket generation for customers. Accessible at the root URL.', path: '/', color: 'from-blue-500 to-cyan-500' },
              { icon: Monitor, title: 'Public Display', description: 'High-visibility screen showing currently serving numbers. Includes voice announcements and TV mode.', path: '/display', color: 'from-teal-500 to-emerald-500' },
              { icon: BarChart3, title: 'Admin & Staff', description: 'Counter dashboards for staff and a full management suite for administrators.', path: '/staff-login', color: 'from-violet-500 to-purple-600' },
            ].map(({ icon: Icon, title, description, path, color }) => (
              <button
                key={title}
                onClick={() => navigate(path)}
                className="group text-left bg-card border border-border/60 rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color}`} />
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-sm`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>
                <div className="flex items-center gap-1 text-xs text-primary font-semibold">
                  Open <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Step-by-step by Role ── */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3">Step-by-Step Guide</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Select your role to see the exact workflow for that user type.</p>
          </div>

          {/* Role Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {roles.map(role => {
              const Icon = role.icon;
              const isActive = activeRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${role.gradient} text-white shadow-md ring-4 ${role.ring}`
                      : 'border border-border bg-card hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {role.label}
                </button>
              );
            })}
          </div>

          {/* Steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {currentRole.steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className="flex gap-5 bg-card border border-border/60 rounded-2xl p-5 lg:p-6 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-black text-lg text-foreground">
                        {step.number}
                      </div>
                      {i < currentRole.steps.length - 1 && (
                        <div className="w-px flex-1 bg-border/60 my-2" />
                      )}
                    </div>
                    <div className="pt-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-5 h-5 ${step.color}`} />
                        <h3 className="text-base font-bold text-foreground">{step.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* ── Key Features ── */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3">Key Features</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">All features work out-of-the-box with no backend required.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, description, color, bg }) => (
              <div key={title} className="bg-card border border-border/60 rounded-2xl p-5 hover:shadow-sm transition-shadow">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-bold text-foreground mb-1 text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Demo Credentials ── */}
        <section>
          <div className="bg-card border border-border/60 rounded-3xl p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Demo Login Credentials</h2>
                <p className="text-sm text-muted-foreground">Click any row to auto-fill the login form</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Username</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Access Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {[
                    { role: 'Admin', username: 'admin', password: 'admin123', access: 'Full — Admin Dashboard, all tabs', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
                    { role: 'Cashier', username: 'cashier1', password: 'cash123', access: 'Cashier counters only', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
                    { role: 'Registrar', username: 'registrar1', password: 'reg123', access: 'Registrar counters only', badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
                  ].map(item => (
                    <tr
                      key={item.username}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => navigate('/staff-login')}
                    >
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.badge}`}>{item.role}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-foreground">{item.username}</td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">{item.password}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{item.access}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Common questions about how the system works.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => <FAQAccordion key={i} faq={faq} index={i} />)}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-gradient-to-br from-primary to-blue-600 rounded-3xl p-8 lg:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            The system is running live. Get a queue ticket, view the display, or sign in as staff to explore the full experience.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-7 py-3 bg-white text-primary rounded-xl font-bold hover:bg-white/90 transition-colors shadow-md"
            >
              Go to Kiosk
            </button>
            <button
              onClick={() => navigate('/staff-login')}
              className="px-7 py-3 bg-white/10 border border-white/30 text-white rounded-xl font-bold hover:bg-white/20 transition-colors"
            >
              Staff Login
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};
