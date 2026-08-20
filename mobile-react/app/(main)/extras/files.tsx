import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { FileManagerScreen } from '@/src/features/platform-tools/file-manager';

export default function FilesRoute() {
  return (
    <RouteGuard path={ROUTES.extras.files}>
      <FileManagerScreen />
    </RouteGuard>
  );
}
