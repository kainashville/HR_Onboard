import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import './globals.css';
import { AppProvider } from '@/lib/store';
import ToastContainer from '@/components/ToastContainer';

export const metadata = {
  title: 'NABA Staff Lifecycle Platform',
  description: 'Onboarding & Offboarding Management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          {children}
          <ToastContainer />
        </AppProvider>
      </body>
    </html>
  );
}
