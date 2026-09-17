import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { appRoutes } from "@/config/routes";

export const metadata: Metadata = {
  title: "Organizational Structure",
};

export default function Page() {
  redirect(appRoutes.modules.hr.organizationalStructure.branches);
}
