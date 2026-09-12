import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { RecruitmentScreen } from '@/src/modules/hr/recruitment';

export default function RecruitmentRoute() {
  return (
    <RouteGuard path={ROUTES.recruitment.root}>
      <RecruitmentScreen />
    </RouteGuard>
  );
}
