import { ToastContainer } from '@/components/ui';

export default function SessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen">
      {children}
      <ToastContainer />
    </div>
  );
}
