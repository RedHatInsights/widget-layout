import { useFlag } from '@unleash/proxy-client-react';
import { useMemo } from 'react';
import * as oldApi from '../api/dashboard-templates-old';
import * as newApi from '../api/dashboard-templates-new';

const mapLayoutType = (type?: string) => (type === 'landing-landingPage' ? 'landingPage' : type);

export const useApi = () => {
  const isNewBackend = useFlag('platform.widget-layout.new-backend');
  return useMemo(() => {
    if (!isNewBackend)
      return {
        ...oldApi,
        getBaseDashboardTemplate: (type?: any) => oldApi.getBaseDashboardTemplate(mapLayoutType(type) as any),
        getDashboardTemplates: (type?: any) => oldApi.getDashboardTemplates(mapLayoutType(type) as any),
      } as unknown as typeof newApi;
    return newApi;
  }, [isNewBackend]);
};
