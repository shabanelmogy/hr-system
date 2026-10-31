import AuraToast from '@primeuix/themes/aura/toast';
import type { ToastDesignTokens } from '@primeuix/themes/types/toast';
/** Lazy shared feedback preset; no full primitive palette or initial-bundle cost. */
const success={background:'var(--surface)',borderColor:'var(--success)',color:'var(--success)',detailColor:'var(--foreground)',shadow:'0 8px 24px color-mix(in srgb,var(--foreground) 12%,transparent)',closeButton:{hoverBackground:'var(--accent)',focusRing:{color:'var(--ring)',shadow:'none'}}};
export const toastPreset={...AuraToast,root:{...AuraToast.root,width:'22rem',borderRadius:'12px'},colorScheme:{light:{success},dark:{success}}} satisfies ToastDesignTokens;
