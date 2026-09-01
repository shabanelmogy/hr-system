import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Organizational Structure",
};

export default function Page() {
  redirect("/basic-data/organizational-structure/branches");
}
