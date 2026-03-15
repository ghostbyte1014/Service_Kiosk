import { RouterProvider } from 'react-router';
import { QueueProvider } from './context/QueueContext';
import { router } from './routes';

export default function App() {
  return (
    <QueueProvider>
      <RouterProvider router={router} />
    </QueueProvider>
  );
}