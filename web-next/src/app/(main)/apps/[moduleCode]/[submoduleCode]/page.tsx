"use client";

import { useParams } from "next/navigation";

import { SubmoduleEntryPage } from "@/platform/modules/SubmoduleEntryPage";

export default function ModuleSubmodulePage() {
  const params = useParams<{ moduleCode: string; submoduleCode: string }>();
  return (
    <SubmoduleEntryPage
      moduleCode={params.moduleCode}
      submoduleCode={params.submoduleCode}
    />
  );
}
