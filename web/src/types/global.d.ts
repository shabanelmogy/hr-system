declare module "@fullcalendar/daygrid/main.css";
declare module "@fullcalendar/timegrid/main.css";
declare module "@fullcalendar/list/main.css";
declare module "*.css";

// Vite environment variable typings
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  // add more VITE_ variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
