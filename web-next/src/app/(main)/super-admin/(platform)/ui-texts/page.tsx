import { redirect } from "next/navigation";
import { appRoutes } from "@/config/routes";
export default function Page(){redirect(`${appRoutes.platform.settings}?tab=system-ui-texts`);}
