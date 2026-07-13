// basicDataConfig.tsx
import CategoryIcon from "@mui/icons-material/Category";
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
      NavigationTitles.COUNTRIES,
      secondaryIcon(<CategoryIcon />),
      appRoutes.basicData.countries,
      undefined,
      [permissions.ViewCountries]
    ),
    createNavItem(
      NavigationTitles.STATES,
      secondaryIcon(<LocationCityIcon />),
      appRoutes.basicData.states,
      undefined,
      [permissions.ViewStates]
    ),
    createNavItem(
      NavigationTitles.ADDRESS_TYPES,
      secondaryIcon(<CategoryIcon />),
      appRoutes.basicData.addressTypes,
      undefined,
      [permissions.ViewAddressTypes]
    ),
    createNavItem(
      NavigationTitles.DISTRICTS,
      secondaryIcon(<LocationCityIcon />),
      appRoutes.basicData.districts,
      undefined,
      [permissions.ViewDistricts]
    ),
  ];

  const geographicDataItem = createNavItem(
    NavigationTitles.GEOGRAPHIC_DATA,
    secondaryIcon(<LocationCityIcon />),
    undefined,
    undefined,
    [permissions.ViewCountries],
    geographicItems
  );

  return createNavSection(
    NavigationSectionId.Basic_DATA,
    NavigationTitles.BASIC_DATA,
    sectionIcon,
    [geographicDataItem]
  );
};
