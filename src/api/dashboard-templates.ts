import { Layout } from 'react-grid-layout';
import { ScalprumComponentProps } from '@scalprum/react-core';
import { dropping_elem_id } from '../consts';
import { VisibilityFunctions } from '@redhat-cloud-services/types';

const getRequestHeaders = () => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
});

export const widgetIdSeparator = '#';

export type LayoutTypes = 'landingPage';

export type Variants = 'sm' | 'md' | 'lg' | 'xl';

export type LayoutWithTitle = Layout & { title: string };

export type TemplateConfig = {
  [k in Variants]: LayoutWithTitle[];
};

export type PartialTemplateConfig = Partial<TemplateConfig>;

// extended type the UI tracks but not the backend
export type ExtendedLayoutItem = LayoutWithTitle & {
  widgetType: string;
  config?: WidgetConfiguration;
  locked?: boolean;
};

// extended type the UI tracks but not the backend
export type ExtendedTemplateConfig = {
  [k in Variants]: ExtendedLayoutItem[];
};

// extended type the UI tracks but not the backend
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
  userIdentityID: number;
  default: boolean;
  TemplateBase: {
    name: string;
    displayName: string;
  };
  templateConfig: TemplateConfig;
};

// TODO use dynamic-plugin-sdk CustomError as base class instead
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
    throw new DashboardTemplatesError('chrome-service dashboard-templates API fetch error', resp.status, resp);
  }
};

export const getWidgetIdentifier = (widgetType: string, uniqueId: string = crypto.randomUUID()) => {
  return `${widgetType}${widgetIdSeparator}${uniqueId}`;
};

export async function getBaseDashboardTemplate(): Promise<BaseTemplate[]>;
export async function getBaseDashboardTemplate(type: LayoutTypes): Promise<BaseTemplate>;
export async function getBaseDashboardTemplate(type?: LayoutTypes): Promise<BaseTemplate | BaseTemplate[]> {
  const resp = await fetch(`/api/chrome-service/v1/dashboard-templates/base-template${type ? `?dashboard=${type}` : ''}`, {
    method: 'GET',
    headers: getRequestHeaders(),
  });
  handleErrors(resp);
  const json = await resp.json();
  return json.data;
}

// Returns multiple templates for a user (user can have multiple template copies) - we will render the one marked default: true by default
export async function getDashboardTemplates(): Promise<DashboardTemplate[]>;
export async function getDashboardTemplates(type: LayoutTypes): Promise<DashboardTemplate[]>;
export async function getDashboardTemplates(type?: LayoutTypes): Promise<DashboardTemplate | DashboardTemplate[]> {
  const resp = await fetch(`/api/chrome-service/v1/dashboard-templates${type ? `?dashboard=${type}` : ''}`, {
    method: 'GET',
    headers: getRequestHeaders(),
  });
  handleErrors(resp);
  const json = await resp.json();
  return json.data;
}

export async function getWidgetMapping(): Promise<WidgetMapping> {
  const resp = await fetch(`/api/chrome-service/v1/dashboard-templates/widget-mapping`, {
    method: 'GET',
    headers: getRequestHeaders(),
  });
  handleErrors(resp);
  const json = await resp.json();
  return json.data;
}

export const resetDashboardTemplate = async (type: LayoutTypes): Promise<DashboardTemplate> => {
  const resp = await fetch(`/api/chrome-service/v1/dashboard-templates/base-template/fork${type ? `?dashboard=${type}` : ''}`, {
    method: 'GET',
    headers: getRequestHeaders(),
  });
  handleErrors(resp);
  const json = await resp.json();
  return json.data;
};

export const patchDashboardTemplate = async (
  templateId: DashboardTemplate['id'],
  data: { templateConfig: PartialTemplateConfig }
): Promise<DashboardTemplate> => {
  const resp = await fetch(`/api/chrome-service/v1/dashboard-templates/${templateId}`, {
    method: 'PATCH',
    headers: getRequestHeaders(),
    body: JSON.stringify(data),
  });
  handleErrors(resp);
  const json = await resp.json();
  return json.data;
};

export const deleteDashboardTemplate = async (templateId: DashboardTemplate['id']): Promise<boolean> => {
  const resp = await fetch(`/api/chrome-service/v1/dashboard-templates/${templateId}`, {
    method: 'DELETE',
    headers: getRequestHeaders(),
  });
  handleErrors(resp);
  return resp.status === 204;
};

export const getDefaultTemplate = (templates: DashboardTemplate[]): DashboardTemplate | undefined => {
  return templates.find((itm) => itm.default === true);
};

export const mapWidgetDefaults = (id: string): [string, string] => {
  const [widgetType, i] = id.split(widgetIdSeparator);
  return [widgetType, i];
};

export const mapLayoutWithTitleToExtendedLayout = (layoutWithTitle: LayoutWithTitle): ExtendedLayoutItem => {
  return {
    ...layoutWithTitle,
    widgetType: mapWidgetDefaults(layoutWithTitle.i)[0],
  };
};

export const mapTemplateConfigToExtendedTemplateConfig = (templateConfig: TemplateConfig): ExtendedTemplateConfig => {
  const result: ExtendedTemplateConfig = { sm: [], md: [], lg: [], xl: [] };
  (Object.keys(templateConfig) as Variants[]).forEach((key) => {
    result[key] = templateConfig[key].map(mapLayoutWithTitleToExtendedLayout);
  });
  return result;
};

export const mapExtendedLayoutToLayoutWithTitle = (extendedLayoutItem: ExtendedLayoutItem): LayoutWithTitle => {
  const { x, y, h, i, w, title, maxH, minH, static: isStatic } = extendedLayoutItem;
  return { x, y, h, i, w, title, maxH, minH, static: isStatic };
};

export const mapExtendedTemplateConfigToTemplateConfig = (extendedTemplateConfig: ExtendedTemplateConfig): TemplateConfig => {
  const result: TemplateConfig = { sm: [], md: [], lg: [], xl: [] };
  (Object.keys(extendedTemplateConfig) as Variants[]).forEach((key) => {
    result[key] = extendedTemplateConfig[key].map(mapExtendedLayoutToLayoutWithTitle).filter(({ i }) => i !== dropping_elem_id);
  });
  return result;
};

export const mapPartialExtendedTemplateConfigToPartialTemplateConfig = (
  extendedTemplateConfig: PartialExtendedTemplateConfig
): PartialTemplateConfig => {
  const result: PartialTemplateConfig = {};
  (Object.keys(extendedTemplateConfig) as Variants[]).forEach((key) => {
    result[key] = extendedTemplateConfig[key]?.map(mapExtendedLayoutToLayoutWithTitle).filter(({ i }) => i !== dropping_elem_id);
  });
  return result;
};
