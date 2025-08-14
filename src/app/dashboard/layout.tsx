import type { Metadata } from "next";
import DashboardLayout from "@/components/dashboard/Layout";

export const metadata: Metadata = {
  title: "REDsync Dashboard",
};

export default function RootDashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}


