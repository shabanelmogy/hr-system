import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import { createColoredIcon, createNavItem, createNavSection } from "../navigationUtils";
import { NavigationColors, NavigationSectionId, NavigationTitles } from "../navigationTypes";

export const getFinanceConfig = () => createNavSection(
  NavigationSectionId.FINANCE,
  NavigationTitles.FINANCE,
  createColoredIcon(<AccountBalanceRoundedIcon />, NavigationColors.PURPLE),
  [createNavItem(
    NavigationTitles.FISCAL_YEARS,
    createColoredIcon(<CalendarMonthRoundedIcon />, NavigationColors.LIGHT_PURPLE),
    appRoutes.finance.fiscalYears,
    undefined,
    [permissions.ViewFiscalYears],
  ), createNavItem(
    NavigationTitles.WORKFORCE_PLANS,
    createColoredIcon(<AccountTreeRoundedIcon />, NavigationColors.LIGHT_PURPLE),
    appRoutes.workforcePlans,
    undefined,
    [permissions.ViewWorkforcePlans],
  )],
  undefined,
  [permissions.ViewFiscalYears, permissions.ViewWorkforcePlans],
);
