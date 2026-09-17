// recruitmentConfig.tsx
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import { createColoredIcon, createNavItem, createNavSection } from "@/shared/components/layout/navigation";
export const getRecruitmentConfig = () => {
  const sectionIcon = createColoredIcon(
    <WorkOutlineRoundedIcon />,
    "#4a6da7"
  );
  const itemIcon = createColoredIcon(
    <BadgeRoundedIcon />,
    "#5c7cbc"
  );

  const items = [
    createNavItem(
      "menu.recruitment",
      itemIcon,
      appRoutes.modules.hr.recruitment,
      undefined,
      [permissions.ViewRecruitment]
    ),
  ];

  return createNavSection(
    "recruitment",
    "menu.recruitment",
    sectionIcon,
    items,
    undefined,
    [permissions.ViewRecruitment]
  );
};
