// recruitmentConfig.tsx
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import { createColoredIcon, createNavItem, createNavSection } from "../navigationUtils";
import { NavigationColors, NavigationSectionId, NavigationTitles } from "../navigationTypes";

export const getRecruitmentConfig = () => {
  const sectionIcon = createColoredIcon(
    <WorkOutlineRoundedIcon />,
    NavigationColors.PRIMARY_BLUE
  );
  const itemIcon = createColoredIcon(
    <BadgeRoundedIcon />,
    NavigationColors.SECONDARY_BLUE
  );

  const items = [
    createNavItem(
      NavigationTitles.RECRUITMENT,
      itemIcon,
      appRoutes.recruitment,
      undefined,
      [permissions.ViewRecruitment]
    ),
  ];

  return createNavSection(
    NavigationSectionId.RECRUITMENT,
    NavigationTitles.RECRUITMENT,
    sectionIcon,
    items,
    undefined,
    [permissions.ViewRecruitment]
  );
};
