import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

type DiscardRoleChangesDialogProps = {
  open: boolean;
  onClose: () => void;
  onDiscard: () => void;
};

export default function DiscardRoleChangesDialog(props: DiscardRoleChangesDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Discard unsaved changes?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Your permission changes have not been saved. Do you want to leave this page?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Keep editing</Button>
        <Button onClick={props.onDiscard} color="error" variant="contained" autoFocus>
          Discard changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
