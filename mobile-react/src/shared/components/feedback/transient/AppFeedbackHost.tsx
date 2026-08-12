import { AppToastHost } from './AppToastHost';
import { ErrorDialogHost } from './ErrorDialogHost';

export function AppFeedbackHost() {
  return (
    <>
      <AppToastHost />
      <ErrorDialogHost />
    </>
  );
}
