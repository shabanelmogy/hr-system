// basicDataConfig.tsx
import CategoryIcon from "@mui/icons-material/Category";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import PeopleIcon from "@mui/icons-material/People";
import { appRoutes } from "@/routes/appRoutes";
import {
  NavigationColors,
  NavigationTitles,
  NavigationSectionId,
} from "../navigationTypes";
import Permissions from "@/constants/appPermissions";
import { UserRoles } from "../navigationTypes";
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
      [Permissions.ViewCountries]
    ),
    createNavItem(
      NavigationTitles.STATES,
      secondaryIcon(<LocationCityIcon />),
      appRoutes.basicData.states,
      [UserRoles.ADMIN]
    ),
    createNavItem(
      NavigationTitles.ADDRESS_TYPES,
      secondaryIcon(<CategoryIcon />),
      appRoutes.basicData.addressTypes,
      undefined,
      [Permissions.ViewAddressTypes]
    ),
    createNavItem(
      NavigationTitles.DISTRICTS,
      secondaryIcon(<LocationCityIcon />),
      appRoutes.basicData.districts,
      undefined,
      [Permissions.ViewDistricts]
    ),
  ];

  const geographicDataItem = createNavItem(
    NavigationTitles.GEOGRAPHIC_DATA,
    secondaryIcon(<LocationCityIcon />),
    undefined,
    undefined,
    [Permissions.ViewCountries],
    geographicItems
  );

  // const employeesItem = createNavItem(
  //   NavigationTitles.EMPLOYEES,
  //   secondaryIcon(<PeopleIcon />),
  //   appRoutes.basicData.employees
  // );

  return createNavSection(
    NavigationSectionId.Basic_DATA,
    NavigationTitles.BASIC_DATA,
    sectionIcon,
    [geographicDataItem]
  );
};
