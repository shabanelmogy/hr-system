import { Activity } from "react";
import type { ComponentType } from "react";
import { Box } from "@mui/material";
import type { ViewType } from "./types";

type ViewActivitiesProps = {
  enabled: boolean;
  views: ViewType[];
  activeView: ViewType;
  components: Record<string, ComponentType>;
};

export default function ViewActivities(props: ViewActivitiesProps) {
  if (!props.enabled) return null;

  return (
    <Box>
      {props.views.map((view) => {
        const ViewComponent = props.components[view];
        if (!ViewComponent) return null;
        return (
          <Activity key={view} mode={props.activeView === view ? "visible" : "hidden"}>
            <ViewComponent />
          </Activity>
        );
      })}
    </Box>
  );
}
