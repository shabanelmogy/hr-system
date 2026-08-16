import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { AppointmentManagementScreen } from '@/src/features/platform-tools';

export default function AppointmentsRoute() {
  return (
    <RouteGuard path={ROUTES.extras.appointments}>
      <AppointmentManagementScreen />
    </RouteGuard>
  );
}
