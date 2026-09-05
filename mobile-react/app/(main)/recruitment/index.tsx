import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { RecruitmentScreen } from '@/src/features/recruitment';

export default function RecruitmentRoute() {
  return (
    <RouteGuard path={ROUTES.recruitment.root}>
      <RecruitmentScreen />
    </RouteGuard>
  );
}
