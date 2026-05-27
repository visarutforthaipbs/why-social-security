export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Cancel the pt-16 added by the root layout so the dashboard is full-bleed
  return <div style={{ marginTop: "-4rem" }}>{children}</div>;
}
