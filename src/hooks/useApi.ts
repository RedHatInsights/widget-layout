import { useFlag } from '@unleash/proxy-client-react';
import { useMemo } from 'react';
import * as oldApi from '../api/dashboard-templates-old';
import * as newApi from '../api/dashboard-templates-new';

export const useApi = () => {
  const isNewBackend = useFlag('platform.widget-layout.new-backend');
  return useMemo(() => (isNewBackend ? newApi : oldApi) as typeof newApi, [isNewBackend]);
};
