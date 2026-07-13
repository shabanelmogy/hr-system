// documentsConfig.tsx
import ArchiveIcon from "@mui/icons-material/Archive";
import PeopleIcon from "@mui/icons-material/People";
import Business from "@mui/icons-material/Business";
import Description from "@mui/icons-material/Description";
import { appRoutes } from "../../../../routes/appRoutes";
import { NavigationColors, NavigationTitles, NavigationSectionId } from "../navigationTypes";
import { createColoredIcon, createNavItem, createNavSection } from "../navigationUtils";

export const getDocumentsConfig = () => {
  const sectionIcon = createColoredIcon(<ArchiveIcon />, NavigationColors.DOCUMENTS_ORANGE);
  const itemIcon = createColoredIcon(<Description />, NavigationColors.LIGHT_DOCUMENTS_ORANGE);

  const documentsItems = [
    createNavItem(NavigationTitles.DOCUMENT_OVERVIEW, itemIcon, appRoutes.documents.overview),
    createNavItem(NavigationTitles.EMPLOYEE_DOCUMENTS, createColoredIcon(<PeopleIcon />, NavigationColors.LIGHT_DOCUMENTS_ORANGE), appRoutes.documents.employeeDocuments),
    createNavItem(NavigationTitles.COMPANY_DOCUMENTS, createColoredIcon(<Business />, NavigationColors.LIGHT_DOCUMENTS_ORANGE), appRoutes.documents.companyDocuments),
    createNavItem(NavigationTitles.DOCUMENT_TEMPLATES, itemIcon, appRoutes.documents.templates),
    createNavItem(NavigationTitles.DOCUMENT_ARCHIVES, createColoredIcon(<ArchiveIcon />, NavigationColors.LIGHT_DOCUMENTS_ORANGE), appRoutes.documents.archives),
  ];

  return createNavSection(NavigationSectionId.DOCUMENTS, NavigationTitles.DOCUMENTS, sectionIcon, documentsItems);
};