import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { AppointmentManagementScreen } from '@/src/platform/tools/appointments';

export default function AppointmentsRoute() {
  return (
    <RouteGuard path={ROUTES.extras.appointments}>
      <AppointmentManagementScreen />
    </RouteGuard>
  );
}
