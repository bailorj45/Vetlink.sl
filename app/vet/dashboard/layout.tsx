import { Sidebar } from '@/components/Sidebar';

export default function VetDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar role="vet" />
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}

