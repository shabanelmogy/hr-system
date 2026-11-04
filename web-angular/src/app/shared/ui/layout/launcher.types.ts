import type { AppIconName } from '../icons/app-icon/app-icon';

export type LauncherItem = {
  id: string;
  label: string;
  href: string;
  icon: AppIconName;
  accent: string;
  contrast: string;
  eyebrow?: string;
};
