import { BarChart, TableChart, ViewModule } from "@mui/icons-material";
import type { TFunction } from "i18next";
import type { ViewOption, ViewType } from "./types";

const defaultLabels: Record<string, string> = {
  grid: "Grid",
  cards: "Cards",
  chart: "Chart",
  list: "List",
  smallList: "Small List",
};

function getViewIcon(view: ViewType) {
  const icons = {
    grid: <TableChart />,
    cards: <ViewModule />,
    chart: <BarChart />,
    list: <ViewModule />,
    smallList: <ViewModule />,
  };
  return icons[view as keyof typeof icons] ?? <ViewModule />;
}

export function createViewOptions(
  views: ViewType[],
  labels: Record<string, string>,
  t: TFunction,
): ViewOption[] {
  return views.map((view) => ({
    value: view,
    label: labels[view] || t(`views.${view}`) || defaultLabels[view] || view,
    icon: getViewIcon(view),
  }));
}
