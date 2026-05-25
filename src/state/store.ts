import { atom, createStore } from 'jotai';
import * as oldApi from '../api/dashboard-templates-old';
import * as newApi from '../api/dashboard-templates-new';

export const store = createStore();

export const backendFlagAtom = atom(false);

export const getApi = (): typeof newApi => {
  const isNew = store.get(backendFlagAtom);
  return (isNew ? newApi : oldApi) as typeof newApi;
};
