import type { ReactNode } from "react";
import { BasicDataLayout } from "@/modules/hr/basic-data/layout";

export default function Layout({ children }: { children: ReactNode }) {
  return <BasicDataLayout>{children}</BasicDataLayout>;
}
