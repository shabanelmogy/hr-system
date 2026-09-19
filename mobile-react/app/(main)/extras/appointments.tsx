import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { AppointmentManagementScreen } from '@/src/modules/crm/appointments';

export default function AppointmentsRoute() {
  return (
    <RouteGuard path={ROUTES.extras.appointments}>
      <AppointmentManagementScreen />
    </RouteGuard>
  );
}
