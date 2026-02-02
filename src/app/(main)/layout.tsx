import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import { ToastContainer } from '@/components/ui';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background-white">
      {/* Header */}
      <Header />

      {/* Mobile Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="pb-20 lg:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavBar />

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}
