import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { ServiceSelection } from './pages/ServiceSelection';
import { QueueTicket } from './pages/QueueTicket';
import { PublicDisplay } from './pages/PublicDisplay';
import { StaffLogin } from './pages/StaffLogin';
import { CounterSelect } from './pages/CounterSelect';
import { CounterDashboard } from './pages/CounterDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { QueueTracker } from './pages/QueueTracker';
import { HowItWorks } from './pages/HowItWorks';

export const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      { path: '/', Component: ServiceSelection },
      { path: '/queue-ticket', Component: QueueTicket },
      { path: '/display', Component: PublicDisplay },
      { path: '/staff-login', Component: StaffLogin },
      { path: '/counter-select', Component: CounterSelect },
      { path: '/counter-dashboard', Component: CounterDashboard },
      { path: '/admin', Component: AdminDashboard },
      { path: '/track/:id', Component: QueueTracker },
      { path: '/how-it-works', Component: HowItWorks },
    ],
  },
]);