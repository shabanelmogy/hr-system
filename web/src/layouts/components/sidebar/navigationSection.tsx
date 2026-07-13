/* eslint-disable react/prop-types */
// NavigationSection.jsx
import { useEffect } from "react";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import NavigationItem from "./navigationItem";
import { alpha, useTheme } from "@mui/material/styles";

// Component to highlight matched text
const HighlightedText = ({ text, searchTerm }: { text: string; searchTerm: string }) => {
  const theme = useTheme();

  if (!searchTerm || !text) {
    return <Typography component="span">{text}</Typography>;
  }

  const parts = text.split(new RegExp(`(${searchTerm})`, "gi"));

  return (
    <Typography component="span">
      {parts.map((part, i) => (
        <span
          key={i}
          style={{
            backgroundColor:
              part.toLowerCase() === searchTerm.toLowerCase()
                ? alpha(theme.palette.primary.main, 0.2)
                : "transparent",
            fontWeight:
              part.toLowerCase() === searchTerm.toLowerCase()
                ? "bold"
                : "inherit",
            padding:
              part.toLowerCase() === searchTerm.toLowerCase() ? "0 2px" : "0",
            borderRadius:
              part.toLowerCase() === searchTerm.toLowerCase() ? "2px" : "0",
          }}
        >
          {part}
        </span>
      ))}
    </Typography>
  );
};

function NavigationSection({
  section,
  open,
  t,
  searchTerm = "",
  isExpanded,
  onToggle,
  onNavigate,
}: {
  section: any;
  open: boolean;
  t: (key: string) => string;
  searchTerm?: string;
  isExpanded: boolean;
  onToggle: (sectionId: string, forceState?: boolean) => void;
  onNavigate: (path: string) => void;
}) {
  const theme = useTheme();

  // Check if section title matches the search
  const sectionTitleMatches =
    searchTerm &&
    t(section.title).toLowerCase().includes(searchTerm.toLowerCase());

  // Check if any items match the search (recursive)
  const findMatchingItems = (items: any[]): any[] => {
    const matches = [];
    for (const item of items) {
      if (
        searchTerm &&
        t(item.title).toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        matches.push(item);
      }
      if (item.items && item.items.length > 0) {
        matches.push(...findMatchingItems(item.items));
      }
    }
    return matches;
  };

  const matchingItems = findMatchingItems(section.items);

  const hasMatchingItems = matchingItems.length > 0;

  // Determine which items to show when expanded
  const itemsToShow =
    !searchTerm || sectionTitleMatches
      ? section.items // Show ALL items if no search or section title matches
      : matchingItems; // Show only matching items otherwise

  // Section should be visible if title matches or any items match
  const shouldShowSection =
    !searchTerm || sectionTitleMatches || hasMatchingItems;

  // Auto-expand section when searching
  useEffect(() => {
    if (searchTerm && (sectionTitleMatches || hasMatchingItems) && onToggle) {
      onToggle(section.id, true);
    }
  }, [searchTerm, sectionTitleMatches, hasMatchingItems, section.id, onToggle]);

  // If searching and no matches, hide the section
  if (!shouldShowSection) {
    return null;
  }

  return (
    <List>
      {/* Section Header - Always clickable */}
      <Tooltip title={open ? null : t(section.title)} placement="left">
        <ListItemButton
          onClick={() => onToggle && onToggle(section.id)}
          sx={[
            {
              minHeight: 48,
              px: 2.5,
              backgroundColor: sectionTitleMatches
                ? alpha(theme.palette.primary.main, 0.08)
                : "transparent",
            },
            open
              ? {
                  justifyContent: "initial",
                }
              : {
                  justifyContent: "center",
                },
          ]}
        >
          <ListItemIcon
            sx={[
              {
                minWidth: 0,
                justifyContent: "center",
              },
              open
                ? {
                    mr: 3,
                  }
                : {
                    mr: "auto",
                  },
            ]}
          >
            {section.icon}
          </ListItemIcon>
          <ListItemText
            primary={
              open ? (
                <HighlightedText
                  text={t(section.title)}
                  searchTerm={searchTerm}
                />
              ) : (
                t(section.title)
              )
            }
            sx={[
              open
                ? {
                    opacity: 1,
                  }
                : {
                    opacity: 0,
                  },
            ]}
          />
          {open && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </Tooltip>

      {/* Section Items - Show ALL items if section header matches search */}
      <Collapse in={isExpanded && open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {itemsToShow.map((item: any) => (
            <NavigationItem
              key={item.path || item.title}
              open={open}
              title={t(item.title)}
              titleComponent={
                <HighlightedText text={t(item.title)} searchTerm={searchTerm} />
              }
              icon={item.icon}
              path={item.path}
              searchTerm={searchTerm}
              onNavigate={onNavigate}
              roles={item.roles || []}
              permissions={item.permissions || []}
              items={item.items || []}
            />
          ))}
        </List>
      </Collapse>
    </List>
  );
}

export default NavigationSection;
