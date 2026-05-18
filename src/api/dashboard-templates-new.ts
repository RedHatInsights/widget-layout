import { LayoutItem } from 'react-grid-layout';
import { ScalprumComponentProps } from '@scalprum/react-core';
import { dropping_elem_id } from '../consts';
import { VisibilityFunctions } from '@redhat-cloud-services/types';

const API_BASE = '/api/widget-layout/v1';

const getRequestHeaders = () => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
});

export const widgetIdSeparator = '#';

export type LayoutTypes = string;

export type Variants = 'sm' | 'md' | 'lg' | 'xl';

export type LayoutWithTitle = LayoutItem & { title: string };

export type TemplateConfig = {
  [k in Variants]: LayoutWithTitle[];
};

export type PartialTemplateConfig = Partial<TemplateConfig>;

export type ExtendedLayoutItem = LayoutWithTitle & {
  widgetType: string;
  config?: WidgetConfiguration;
  locked?: boolean;
};

export type ExtendedTemplateConfig = {
  [k in Variants]: ExtendedLayoutItem[];
};

export type PartialExtendedTemplateConfig = Partial<ExtendedTemplateConfig>;

export type BaseTemplate = {
  name: string;
  displayName: string;
  templateConfig: TemplateConfig;
};

export type DashboardTemplate = {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  userId: string;
  default: boolean;
  templateBase: {
    name: string;
    displayName: string;
  };
  templateConfig: TemplateConfig;
  dashboardName: string;
};

export type ExportDashboardTemplate = {
  templateBase: {
    name: string;
    displayName: string;
  };
  templateConfig: TemplateConfig;
};

export class DashboardTemplatesError extends Error {
  constructor(message: string, readonly status: number, readonly response: Response) {
    super(message);

    Object.defineProperty(this, 'name', {
      value: new.target.name,
      configurable: true,
    });

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

export type WidgetDefaults = {
  w: number;
  h: number;
  maxH: number;
  minH: number;
  minW?: number;
};

export type WidgetHeaderLink = {
  title?: string;
  href?: string;
};

type VisibilityFunctionKeys = keyof VisibilityFunctions;

export type WidgetPermission = {
  method: VisibilityFunctionKeys;
  args?: Parameters<VisibilityFunctions[VisibilityFunctionKeys]>;
};

export type WidgetConfiguration = {
  icon?: string;
  headerLink?: WidgetHeaderLink;
  title?: string;
  permissions?: WidgetPermission[];
};

export type WidgetMapping = {
  [key: string]: Pick<ScalprumComponentProps, 'scope' | 'module' | 'importName'> & {
    defaults: WidgetDefaults;
    config?: WidgetConfiguration;
  };
};

const handleErrors = (resp: Response) => {
  if (!resp.ok) {
    throw new DashboardTemplatesError('widget-layout API fetch error', resp.status, resp);
  }
};

export const getWidgetIdentifier = (widgetType: string, uniqueId: string = crypto.randomUUID()) => {
  return `${widgetType}${widgetIdSeparator}${uniqueId}`;
};

// GET /api/widget-layout/v1/{id}
export const getDashboardTemplate = async (templateId: number): Promise<DashboardTemplate> => {
  const resp = await fetch(`${API_BASE}/${templateId}`, {
    method: 'GET',
    headers: getRequestHeaders(),
  });
  handleErrors(resp);
  const json = await resp.json();
  return json;
};

// GET /api/widget-layout/v1/base-templates
// GET /api/widget-layout/v1/base-templates/{name}
export async function getBaseDashboardTemplate(): Promise<BaseTemplate[]>;
export async function getBaseDashboardTemplate(type: LayoutTypes): Promise<BaseTemplate>;
export async function getBaseDashboardTemplate(type?: LayoutTypes): Promise<BaseTemplate | BaseTemplate[]> {
  if (type) {
    const resp = await fetch(`${API_BASE}/base-templates/${type}`, {
      method: 'GET',
      headers: getRequestHeaders(),
    });
    handleErrors(resp);
    return resp.json();
  }
  const resp = await fetch(`${API_BASE}/base-templates`, {
    method: 'GET',
    headers: getRequestHeaders(),
  });
  handleErrors(resp);
  const json = await resp.json();
  return json.data;
}

// GET /api/widget-layout/v1/?dashboardType={type}
export async function getDashboardTemplates(): Promise<DashboardTemplate[]>;
export async function getDashboardTemplates(type: LayoutTypes): Promise<DashboardTemplate[]>;
export async function getDashboardTemplates(type?: LayoutTypes): Promise<DashboardTemplate | DashboardTemplate[]> {
  const resp = await fetch(`${API_BASE}/${type ? `?dashboardType=${type}` : ''}`, {
    method: 'GET',
    headers: getRequestHeaders(),
  });
  handleErrors(resp);
  const json = await resp.json();
  return json.data;
}

// GET /api/widget-layout/v1/
export async function getUsersDashboards(): Promise<DashboardTemplate[]> {
  const resp = await fetch(`${API_BASE}/`, {
    method: 'GET',
    headers: getRequestHeaders(),
  });
  handleErrors(resp);
  const json = await resp.json();
  return json.data;
}

// GET /api/widget-layout/v1/widget-mapping
export async function getWidgetMapping(): Promise<WidgetMapping> {
  const resp = await fetch(`${API_BASE}/widget-mapping`, {
    method: 'GET',
    headers: getRequestHeaders(),
  });
  handleErrors(resp);
  const json = await resp.json();
  return json.data;
}

// POST /api/widget-layout/v1/{id}/reset
export const resetDashboardTemplate = async (templateId: number): Promise<DashboardTemplate> => {
  const resp = await fetch(`${API_BASE}/${templateId}/reset`, {
    method: 'POST',
    headers: getRequestHeaders(),
  });
  handleErrors(resp);
  const json = await resp.json();
  return json.data;
};

// PATCH /api/widget-layout/v1/{id}
export const patchDashboardTemplate = async (
  templateId: DashboardTemplate['id'],
  data: { templateConfig: PartialTemplateConfig }
): Promise<DashboardTemplate> => {
  const resp = await fetch(`${API_BASE}/${templateId}`, {
    method: 'PATCH',
    headers: getRequestHeaders(),
    body: JSON.stringify(data),
  });
  handleErrors(resp);
  const json = await resp.json();
  return json.data;
};

// PATCH /api/widget-layout/v1/{id}
export const patchDashboardTemplateHub = async (
  templateId: DashboardTemplate['id'],
  data: { templateConfig: PartialTemplateConfig }
): Promise<DashboardTemplate> => {
  const resp = await fetch(`${API_BASE}/${templateId}`, {
    method: 'PATCH',
    headers: getRequestHeaders(),
    body: JSON.stringify(data),
  });
  handleErrors(resp);
  const json = await resp.json();
  return json.data;
};

// DELETE /api/widget-layout/v1/{id}
export const deleteDashboardTemplate = async (templateId: DashboardTemplate['id']): Promise<boolean> => {
  const resp = await fetch(`${API_BASE}/${templateId}`, {
    method: 'DELETE',
    headers: getRequestHeaders(),
  });
  handleErrors(resp);
  return resp.status === 204;
};

// DELETE /api/widget-layout/v1/{id}
export const deleteDashboardTemplateFromHub = async (templateId: DashboardTemplate['id']): Promise<boolean> => {
  const resp = await fetch(`${API_BASE}/${templateId}`, {
    method: 'DELETE',
    headers: getRequestHeaders(),
  });
  handleErrors(resp);
  return resp.status === 204;
};

// PATCH /api/widget-layout/v1/{id}/rename
export const renameDashboardTemplate = async (templateId: DashboardTemplate['id'], data: { dashboardName: string }): Promise<DashboardTemplate> => {
  const resp = await fetch(`/api/widget-layout/v1/${templateId}/rename`, {
    method: 'PATCH',
    headers: getRequestHeaders(),
    body: JSON.stringify(data),
  });
  handleErrors(resp);
  const json = await resp.json();
  return json.data;
};

// POST /api/widget-layout/v1/{id}/copy
export const copyDashboardTemplate = async (templateId: DashboardTemplate['id'], data: { dashboardName: string }): Promise<DashboardTemplate> => {
  const resp = await fetch(`${API_BASE}/${templateId}/copy`, {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify(data),
  });
  handleErrors(resp);
  const json = await resp.json();
  return json;
};

export const getDefaultTemplate = (templates: DashboardTemplate[]): DashboardTemplate | undefined => {
  return templates.find((itm) => itm.default === true);
};

// POST /api/widget-layout/v1/{id}/default
export const setDefaultTemplate = async (templateId: DashboardTemplate['id']): Promise<DashboardTemplate> => {
  const resp = await fetch(`${API_BASE}/${templateId}/default`, {
    method: 'POST',
    headers: getRequestHeaders(),
  });
  handleErrors(resp);
  const json = await resp.json();
  return json;
};

// // GET /api/widget-layout/v1/base-templates/{name}/fork
// export const forkBaseTemplate = async (baseTemplateName: string): Promise<DashboardTemplate> => {
//   const resp = await fetch(`${API_BASE}/base-templates/${baseTemplateName}/fork`, {
//     method: 'GET',
//     headers: getRequestHeaders(),
//   });
//   handleErrors(resp);
//   const json = await resp.json();
//   return json;
// };

// POST /api/widget-layout/v1/import
export const importDashboardTemplate = async (data: {
  dashboardName: string;
  templateBase: {
    name: string;
    displayName: string;
  };
  templateConfig: TemplateConfig;
}): Promise<DashboardTemplate> => {
  const resp = await fetch(`${API_BASE}/import`, {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify(data),
  });
  handleErrors(resp);
  const json = await resp.json();
  return json;
};

// GET /api/widget-layout/v1/{id}/export
export const exportDashboardTemplate = async (templateId: number): Promise<ExportDashboardTemplate> => {
  const resp = await fetch(`${API_BASE}/${templateId}/export`, {
    method: 'GET',
    headers: getRequestHeaders(),
  });
  handleErrors(resp);
  const json = await resp.json();
  return json;
};

export const mapWidgetDefaults = (id: string): [string, string] => {
  const [widgetType, i] = id.split(widgetIdSeparator);
  return [widgetType, i];
};

export const mapTemplateConfigToExtendedTemplateConfig = (templateConfig: TemplateConfig): ExtendedTemplateConfig => {
  const result: ExtendedTemplateConfig = { sm: [], md: [], lg: [], xl: [] };
  (Object.keys(templateConfig) as Variants[]).forEach((key) => {
    result[key] = templateConfig[key].map(
      (layoutWithTitle: LayoutWithTitle): ExtendedLayoutItem => ({
        ...layoutWithTitle,
        widgetType: mapWidgetDefaults(layoutWithTitle.i)[0],
      })
    );
  });
  return result;
};

export const extendLayout = (extendedTemplateConfig: ExtendedTemplateConfig): ExtendedTemplateConfig => {
  const result: ExtendedTemplateConfig = { sm: [], md: [], lg: [], xl: [] };
  (Object.keys(extendedTemplateConfig) as Variants[]).forEach((key) => {
    result[key] = extendedTemplateConfig[key]
      .filter(({ i }) => i !== dropping_elem_id)
      .map((item) => ({
        ...item,
        widgetType: mapWidgetDefaults(item.i)[0],
      }));
  });
  return result;
};
