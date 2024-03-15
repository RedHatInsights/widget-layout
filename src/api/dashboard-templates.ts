import { Layout } from 'react-grid-layout';
import { WidgetTypes } from '../Components/Widgets/widgetTypes';
import { dropping_elem_id } from '../Components/DnDLayout/GridLayout';

const getRequestHeaders = (token: string) => ({
  Accept: 'application/json',
  Authorization: `Bearer ${token}`,
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
  widgetType: WidgetTypes;
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

const handleErrors = (resp: Response) => {
  if (!resp.ok) {
    throw new DashboardTemplatesError('chrome-service dashboard-templates API fetch error', resp.status, resp);
  }
};

export async function getBaseDashboardTemplate(token: string): Promise<BaseTemplate[]>;
export async function getBaseDashboardTemplate(token: string, type: LayoutTypes): Promise<BaseTemplate>;
export async function getBaseDashboardTemplate(token: string, type?: LayoutTypes): Promise<BaseTemplate | BaseTemplate[]> {
  const resp = await fetch(`/api/chrome-service/v1/dashboard-templates/base-template${type ? `?dashboard=${type}` : ''}`, {
    method: 'GET',
    headers: getRequestHeaders(token),
  });
  handleErrors(resp);
  const json = await resp.json();
  return json.data;
}

// Returns multiple templates for a user (user can have multiple template copies) - we will render the one marked default: true by default
export async function getDashboardTemplates(token: string): Promise<DashboardTemplate[]>;
export async function getDashboardTemplates(token: string, type: LayoutTypes): Promise<DashboardTemplate[]>;
export async function getDashboardTemplates(token: string, type?: LayoutTypes): Promise<DashboardTemplate | DashboardTemplate[]> {
  const resp = await fetch(`/api/chrome-service/v1/dashboard-templates${type ? `?dashboard=${type}` : ''}`, {
    method: 'GET',
    headers: getRequestHeaders(token),
  });
  handleErrors(resp);
  const json = await resp.json();
  return json.data;
}

export const patchDashboardTemplate = async (
  templateId: DashboardTemplate['id'],
  data: { templateConfig: PartialTemplateConfig },
  token: string
): Promise<DashboardTemplate> => {
  const resp = await fetch(`/api/chrome-service/v1/dashboard-templates/${templateId}`, {
    method: 'PATCH',
    headers: getRequestHeaders(token),
    body: JSON.stringify(data),
  });
  handleErrors(resp);
  const json = await resp.json();
  return json.data;
};

export const deleteDashboardTemplate = async (templateId: DashboardTemplate['id'], token: string): Promise<boolean> => {
  const resp = await fetch(`/api/chrome-service/v1/dashboard-templates/${templateId}`, {
    method: 'DELETE',
    headers: getRequestHeaders(token),
  });
  handleErrors(resp);
  return resp.status === 204;
};

export const getDefaultTemplate = (templates: DashboardTemplate[]): DashboardTemplate | undefined => {
  return templates.find((itm) => itm.default === true);
};

export const getWidgetIdentifier = (widgetType: WidgetTypes, uniqueId: string = crypto.randomUUID()) => {
  return `${widgetType}${widgetIdSeparator}${uniqueId}`;
};

export const mapWidgetDefaults = (id: string): [WidgetTypes, string] => {
  const [widgetType, i] = id.split(widgetIdSeparator);
  // we will need some type guards here and schema validation to remove unknown widgets
  return [widgetType as WidgetTypes, i];
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
