import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import { createColoredIcon, createNavItem, createNavSection } from "@/shared/components/layout/navigation";
export const getFinanceConfig = () => createNavSection(
  "finance",
  "menu.finance",
  createColoredIcon(<AccountBalanceRoundedIcon />, "#7b1fa2"),
  [createNavItem(
    "menu.fiscalYears",
    createColoredIcon(<CalendarMonthRoundedIcon />, "#8e24aa"),
    appRoutes.finance.fiscalYears,
    undefined,
    [permissions.ViewFiscalYears],
  )],
  undefined,
  [permissions.ViewFiscalYears],
);
