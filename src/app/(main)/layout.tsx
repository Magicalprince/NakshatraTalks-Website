import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import { ToastContainer } from '@/components/ui';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background-offWhite">
      {/* Desktop Sidebar - Fixed on left */}
      <DesktopSidebar />

      {/* Mobile Sidebar (overlay) */}
      <Sidebar />

      {/* Main content wrapper */}
      <div className="lg:ml-[260px] min-h-screen flex flex-col">
        {/* Header - Only on mobile/tablet */}
        <div className="lg:hidden">
          <Header />
        </div>

        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
          <div>
            {/* Breadcrumb or page title can go here */}
          </div>

          {/* Desktop header actions */}
          <div className="flex items-center gap-4">
            {/* Notifications, search, etc. can go here */}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavBar />

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}
