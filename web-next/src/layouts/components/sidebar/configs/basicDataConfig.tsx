// basicDataConfig.tsx
import CategoryIcon from "@mui/icons-material/Category";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import { appRoutes } from "@/config/routes";
import {
  NavigationColors,
  NavigationTitles,
  NavigationSectionId,
} from "../navigationTypes";
import { permissions } from "@/lib/auth/permissions";
import {
  createColoredIcon,
  createNavItem,
  createNavSection,
} from "../navigationUtils";


export const getBasicDataConfig = () => {
  const sectionIcon = createColoredIcon(
    <CategoryIcon />,
    NavigationColors.PRIMARY_BLUE
  );
  const secondaryIcon = (icon: React.ReactElement) =>
    createColoredIcon(icon, NavigationColors.SECONDARY_BLUE);

  const geographicItems = [
    createNavItem(
      NavigationTitles.ADDRESS_TYPES,
      secondaryIcon(<CategoryIcon />),
      appRoutes.basicData.addressTypes,
      undefined,
      [permissions.ViewAddressTypes]
    ),
  ];

  const organizationalStructureItems = [
    createNavItem("organizationalStructure.resources.branches", secondaryIcon(<BusinessRoundedIcon />), appRoutes.basicData.organizationalStructure.branches, undefined, [permissions.ViewOrganizationalStructure]),
    createNavItem("organizationalStructure.resources.departments", secondaryIcon(<BusinessRoundedIcon />), appRoutes.basicData.organizationalStructure.departments, undefined, [permissions.ViewOrganizationalStructure]),
    createNavItem("organizationalStructure.resources.divisions", secondaryIcon(<BusinessRoundedIcon />), appRoutes.basicData.organizationalStructure.divisions, undefined, [permissions.ViewOrganizationalStructure]),
    createNavItem("organizationalStructure.resources.job-titles", secondaryIcon(<BusinessRoundedIcon />), appRoutes.basicData.organizationalStructure.jobTitles, undefined, [permissions.ViewOrganizationalStructure]),
    createNavItem("organizationalStructure.resources.job-levels", secondaryIcon(<BusinessRoundedIcon />), appRoutes.basicData.organizationalStructure.jobLevels, undefined, [permissions.ViewOrganizationalStructure]),
    createNavItem("organizationalStructure.resources.positions", secondaryIcon(<BusinessRoundedIcon />), appRoutes.basicData.organizationalStructure.positions, undefined, [permissions.ViewOrganizationalStructure]),
    createNavItem("organizationalStructure.resources.job-descriptions", secondaryIcon(<BusinessRoundedIcon />), appRoutes.basicData.organizationalStructure.jobDescriptions, undefined, [permissions.ViewOrganizationalStructure]),
    createNavItem(
      NavigationTitles.COMPANY_GEOGRAPHIC_SCOPE,
      secondaryIcon(<BusinessRoundedIcon />),
      appRoutes.basicData.companyGeographicScope,
      undefined,
      [permissions.ViewCompanyGeographicScope],
    ),
  ];

  const geographicDataItem = createNavItem(
    NavigationTitles.GEOGRAPHIC_DATA,
    secondaryIcon(<LocationCityIcon />),
    undefined,
    undefined,
    [permissions.ViewAddressTypes],
    geographicItems
  );

  const organizationalStructureItem = createNavItem(
    NavigationTitles.ORGANIZATIONAL_STRUCTURE,
    secondaryIcon(<BusinessRoundedIcon />),
    undefined,
    undefined,
    [permissions.ViewCompanyGeographicScope, permissions.ViewOrganizationalStructure],
    organizationalStructureItems,
  );

  return {
    ...createNavSection(
    NavigationSectionId.Basic_DATA,
    NavigationTitles.BASIC_DATA,
    sectionIcon,
    [geographicDataItem, organizationalStructureItem]
    ),
    path: appRoutes.basicData.index,
  };
};
