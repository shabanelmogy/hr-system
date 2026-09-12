import { Lock, LockOpen, Person, PersonOff } from "@mui/icons-material";
import { Chip } from "@mui/material";
import type { GridRenderCellParams } from "@mui/x-data-grid";
import type { Translator, User } from "../../types";

export const renderDisabledStatus =
  (t: Translator) =>
  function DisabledStatusCell({ value }: GridRenderCellParams<User, boolean>): React.ReactNode {
    return value ? (
      <Chip label={t("users.disabled")} color="error" size="small" icon={<PersonOff sx={{ fontSize: 16 }} />} />
    ) : (
      <Chip label={t("users.enabled")} color="success" variant="outlined" size="small" icon={<Person sx={{ fontSize: 16 }} />} />
    );
  };

export const renderLockedStatus =
  (t: Translator) =>
  function LockedStatusCell({ value }: GridRenderCellParams<User, boolean>): React.ReactNode {
    return value ? (
      <Chip label={t("users.locked")} color="warning" size="small" icon={<Lock sx={{ fontSize: 16 }} />} />
    ) : (
      <Chip label={t("users.unlocked")} color="info" variant="outlined" size="small" icon={<LockOpen sx={{ fontSize: 16 }} />} />
    );
  };
