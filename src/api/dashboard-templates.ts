// import * as oldApi from './dashboard-templates-old';
// import * as newApi from './dashboard-templates-new';

// let mode: boolean | null = null;
// let resolveReady: (value: boolean) => void;
// const ready = new Promise<boolean>((resolve) => {
//   resolveReady = resolve;
// });

// export const setBackendMode = (isNew: boolean) => {
//   mode = isNew;
//   resolveReady(isNew);
// };

// const getMode = (): Promise<boolean> => {
//   if (mode !== null) return Promise.resolve(mode);
//   return ready;
// };

// ── Types ──

export type {
  LayoutTypes,
  Variants,
  LayoutWithTitle,
  TemplateConfig,
  PartialTemplateConfig,
  ExtendedLayoutItem,
  ExtendedTemplateConfig,
  PartialExtendedTemplateConfig,
  BaseTemplate,
  DashboardTemplate,
  ExportDashboardTemplate,
  WidgetDefaults,
  WidgetHeaderLink,
  WidgetPermission,
  WidgetConfiguration,
  WidgetMapping,
} from './dashboard-templates-new';

export {
  widgetIdSeparator,
  DashboardTemplatesError,
  getWidgetIdentifier,
  getDefaultTemplate,
  mapWidgetDefaults,
  mapTemplateConfigToExtendedTemplateConfig,
  extendLayout,
} from './dashboard-templates-new';

// // ── Flag-aware API functions ──

// type OldApi = typeof oldApi;

// function routed<K extends keyof OldApi>(name: K, isNew: boolean): OldApi[K] {
//   return (async (...args: unknown[]) => {
//     // const isNew = await getMode();
//     const target = isNew ? newApi : oldApi;
//     return (target as unknown as Record<string, (...a: unknown[]) => unknown>)[name](...args);
//   }) as unknown as OldApi[K];
// }

// const layoutTypeMap: Record<string, string> = {
//   landingPage: 'landing-landingPage',
// };

// const mapLayoutType = (type?: oldApi.LayoutTypes): oldApi.LayoutTypes | undefined =>
//   type ? ((layoutTypeMap[type] ?? type) as oldApi.LayoutTypes) : undefined;

// export const getDashboardTemplate = routed('getDashboardTemplate');
// export const getUsersDashboards = routed('getUsersDashboards');
// export const getWidgetMapping = routed('getWidgetMapping');
// export const resetDashboardTemplate = routed('resetDashboardTemplate');
// export const patchDashboardTemplate = routed('patchDashboardTemplate');
// export const patchDashboardTemplateHub = routed('patchDashboardTemplateHub');
// export const deleteDashboardTemplate = routed('deleteDashboardTemplate');
// export const deleteDashboardTemplateFromHub = routed('deleteDashboardTemplateFromHub');
// export const importDashboardTemplate = routed('importDashboardTemplate');
// export const exportDashboardTemplate = routed('exportDashboardTemplate');
// export const copyDashboardTemplate = routed('copyDashboardTemplate');
// export const setDefaultTemplate = routed('setDefaultTemplate');

// // These two need manual handling for layout type mapping
// export async function getBaseDashboardTemplate(): Promise<oldApi.BaseTemplate[]>;
// export async function getBaseDashboardTemplate(type: oldApi.LayoutTypes): Promise<oldApi.BaseTemplate>;
// export async function getBaseDashboardTemplate(type?: oldApi.LayoutTypes) {
//   const isNew = await getMode();
//   const mappedType = mapLayoutType(type);
//   if (isNew) {
//     return mappedType ? newApi.getBaseDashboardTemplate(mappedType) : newApi.getBaseDashboardTemplate();
//   }
//   return type ? oldApi.getBaseDashboardTemplate(type) : oldApi.getBaseDashboardTemplate();
// }

// export async function getDashboardTemplates(): Promise<oldApi.DashboardTemplate[]>;
// export async function getDashboardTemplates(type: oldApi.LayoutTypes): Promise<oldApi.DashboardTemplate[]>;
// export async function getDashboardTemplates(type?: oldApi.LayoutTypes) {
//   const isNew = await getMode();
//   const mappedType = mapLayoutType(type);
//   if (isNew) {
//     return mappedType ? newApi.getDashboardTemplates(mappedType) : newApi.getDashboardTemplates();
//   }
//   return type ? oldApi.getDashboardTemplates(type) : oldApi.getDashboardTemplates();
// }

// // ── New-backend-only functions ──

// export { renameDashboardTemplate } from './dashboard-templates-new';
