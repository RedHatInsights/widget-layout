import { Layout } from 'react-grid-layout';
import { ScalprumComponentProps } from '@scalprum/react-core';
import { dropping_elem_id } from '../consts';
import { VisibilityFunctions } from '@redhat-cloud-services/types';

const getRequestHeaders = () => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
});

export const widgetIdSeparator = '#';

export type LayoutTypes = 'landingPage' | 'landing-landingPage';

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

// Returns multiple templates for a user (user can have multiple template copies) - we will render the one marked default: true by default
export async function getDashboardTemplates(): Promise<DashboardTemplate[]>;
export async function getDashboardTemplates(type: LayoutTypes): Promise<DashboardTemplate[]>;
export async function getDashboardTemplates(type?: LayoutTypes): Promise<DashboardTemplate | DashboardTemplate[]> {
  const searchParams = new URLSearchParams();
  if (type) {
    searchParams.append('dashboardType', type);
  }
  const url = new URL(`/api/widget-layout/v1/`, window.location.origin);
  url.search = searchParams.toString();
  const resp = await fetch(url.toString(), {
    method: 'GET',
    headers: getRequestHeaders(),
  });
  const json = await resp.json();
  console.log({ json });
  return json.data;
}

export async function getWidgetMapping(): Promise<WidgetMapping> {
  const resp = await fetch(`/api/widget-layout/v1/widget-mapping`, {
    method: 'GET',
    headers: getRequestHeaders(),
  });
  handleErrors(resp);
  const json = await resp.json();
  return json.data;
}

export const resetDashboardTemplate = async (templateId: number): Promise<DashboardTemplate> => {
  const resp = await fetch(`/api/widget-layout/v1/${templateId}/reset`, {
    method: 'POST',
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
  const resp = await fetch(`/api/widget-layout/v1/${templateId}`, {
    method: 'PATCH',
    headers: getRequestHeaders(),
    body: JSON.stringify(data),
  });
  handleErrors(resp);
  const json = await resp.json();
  return json.data;
};

export const getDefaultTemplate = (templates: DashboardTemplate[]): DashboardTemplate | undefined => {
  return templates.find((itm) => itm.default === true);
};

export const mapWidgetDefaults = (id: string): [string, string] => {
  const [widgetType, i] = id.split(widgetIdSeparator);
  return [widgetType, i];
};

// Returns template enhanced with widgetTypes
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
