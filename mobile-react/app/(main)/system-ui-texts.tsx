import { Redirect } from 'expo-router';
import { RouteGuard } from '@/src/platform/auth';
import { ROUTES } from '@/src/core/constants/routes';
export default function Page(){return <RouteGuard path={ROUTES.systemUiTexts}><Redirect href={ROUTES.settings}/></RouteGuard>;}
