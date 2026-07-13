declare module "@fullcalendar/daygrid/main.css";
declare module "@fullcalendar/timegrid/main.css";
declare module "@fullcalendar/list/main.css";
declare module "*.css";

// Vite environment variable typings
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_API_URL?: string;
    readonly NEXT_PUBLIC_SIGNALR_HUB_URL?: string;
    readonly NEXT_PUBLIC_REPORT_API_URL?: string;
    readonly NEXT_PUBLIC_GOOGLE_CLIENT_ID?: string;
    readonly NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY?: string;
  }
}
