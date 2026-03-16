import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ThemeProvider, useTheme } from './hooks/ThemeContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

function ThemedToaster() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: isDark ? '#0f0f0f' : '#ffffff',
          color: isDark ? '#e2e8f0' : '#1e293b',
          border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e4e7',
          fontSize: '13px',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        },
      }}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemedToaster />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}