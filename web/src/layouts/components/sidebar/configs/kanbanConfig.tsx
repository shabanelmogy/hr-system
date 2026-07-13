// kanbanConfig.tsx
import Permissions from "@/constants/appPermissions";
import { appRoutes } from "@/routes/appRoutes";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import {
    NavigationColors,
    NavigationSectionId,
    NavigationTitles,
} from "../navigationTypes";
import {
    createColoredIcon,
    createNavItem,
    createNavSection,
} from "../navigationUtils";

export const getKanbanConfig = () => {
    const sectionIcon = createColoredIcon(
        <ViewKanbanIcon />,
        NavigationColors.HR_BLUE
    );
    const secondaryIcon = (icon: React.ReactElement) =>
        createColoredIcon(icon, NavigationColors.LIGHT_HR_BLUE);

    const boardsItem = createNavItem(
        NavigationTitles.KANBAN_BOARDS,
        secondaryIcon(<ViewKanbanIcon />),
        appRoutes.kanban.boards,
        undefined,
        [Permissions.ViewKanbanBoards]
    );

    return createNavSection(
        NavigationSectionId.KANBAN,
        NavigationTitles.KANBAN,
        sectionIcon,
        [boardsItem]
    );
};