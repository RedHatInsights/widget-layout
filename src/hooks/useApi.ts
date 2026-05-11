import { useFlag } from '@unleash/proxy-client-react';
import { useMemo } from 'react';
import * as oldApi from '../api/dashboard-templates-old';
import * as newApi from '../api/dashboard-templates-new';

const mapLayoutType = (type?: string) => (type === 'landingPage' ? 'landing-landingPage' : type);

export const useApi = () => {
  const isNewBackend = useFlag('platform.widget-layout.new-backend');
  return useMemo(() => {
    if (!isNewBackend) return oldApi as unknown as typeof newApi;
    return {
      ...newApi,
      getBaseDashboardTemplate: (type?: any) => newApi.getBaseDashboardTemplate(mapLayoutType(type) as any),
      getDashboardTemplates: (type?: any) => newApi.getDashboardTemplates(mapLayoutType(type) as any),
    } as typeof newApi;
  }, [isNewBackend]);
};
