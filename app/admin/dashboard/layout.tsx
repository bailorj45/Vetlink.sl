import { Sidebar } from '@/components/Sidebar';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar role="admin" />
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}

