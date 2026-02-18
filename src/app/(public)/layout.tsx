import { WebNavbar } from '@/components/layout/WebNavbar';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { WebFooter } from '@/components/layout/WebFooter';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <WebNavbar />
      <MobileMenu />

      <main className="flex-1">{children}</main>

      <WebFooter />
    </div>
  );
}
