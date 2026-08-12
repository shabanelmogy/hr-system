import { useId, type ReactNode } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

export interface FormTab<Value extends string> {
  value: Value;
  label: ReactNode;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  hasError?: boolean;
  errorLabel?: ReactNode;
}

export interface FormTabsProps<Value extends string> {
  label: string;
  tabs: readonly FormTab<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  keepMounted?: boolean;
  sx?: SxProps<Theme>;
  panelSx?: SxProps<Theme>;
}

export function FormTabs<Value extends string>({
  label,
  tabs,
  value,
  onChange,
  keepMounted = true,
  sx,
  panelSx,
}: FormTabsProps<Value>) {
  const id = useId();
  const activeTab = tabs.find((tab) => tab.value === value) ?? tabs[0];

  return (
    <Box sx={[{ width: "100%" }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>
      <Tabs
        aria-label={label}
        value={activeTab?.value ?? false}
        onChange={(_event, nextValue: Value) => onChange(nextValue)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          minHeight: 48,
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": { minHeight: 48, textTransform: "none", letterSpacing: 0 },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            aria-controls={`${id}-${tab.value}-panel`}
            disabled={tab.disabled}
            id={`${id}-${tab.value}-tab`}
            key={tab.value}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                {tab.icon}
                <Box component="span">{tab.label}</Box>
                {tab.hasError ? (
                  <>
                    <Box
                      component="span"
                      aria-hidden
                      sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "error.main" }}
                    />
                    {tab.errorLabel ? (
                      <Box
                        component="span"
                        sx={{
                          position: "absolute",
                          width: 1,
                          height: 1,
                          p: 0,
                          m: -1,
                          overflow: "hidden",
                          clip: "rect(0 0 0 0)",
                          whiteSpace: "nowrap",
                          border: 0,
                        }}
                      >
                        {tab.errorLabel}
                      </Box>
                    ) : null}
                  </>
                ) : null}
              </Box>
            }
            value={tab.value}
            sx={tab.hasError ? { color: "error.main" } : undefined}
          />
        ))}
      </Tabs>

      {tabs.map((tab) => {
        const selected = tab.value === activeTab?.value;
        if (!selected && !keepMounted) return null;
        return (
          <Box
            aria-labelledby={`${id}-${tab.value}-tab`}
            hidden={!selected}
            id={`${id}-${tab.value}-panel`}
            key={tab.value}
            role="tabpanel"
            sx={[{ pt: 2.5 }, ...(Array.isArray(panelSx) ? panelSx : panelSx ? [panelSx] : [])]}
          >
            {tab.content}
          </Box>
        );
      })}
    </Box>
  );
}
