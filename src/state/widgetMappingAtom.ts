import { atom } from 'jotai';
import type { WidgetMapping } from '../api/dashboard-templates';

export const widgetMappingAtom = atom<WidgetMapping>({});
