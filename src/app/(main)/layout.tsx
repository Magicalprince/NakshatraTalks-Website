import { WebNavbar } from '@/components/layout/WebNavbar';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { WebFooter } from '@/components/layout/WebFooter';
import { ToastContainer } from '@/components/ui';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background-offWhite flex flex-col">
      <WebNavbar />
      <MobileMenu />

      <main className="flex-1">
        {children}
      </main>

      <WebFooter />
      <ToastContainer />
    </div>
  );
}
