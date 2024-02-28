import { atom } from 'jotai';
import { ExtendedTemplateConfig } from '../api/dashboard-templates';

export const initialTemplate: ExtendedTemplateConfig = { sm: [], md: [], lg: [], xl: [] };

export const templateAtom = atom<ExtendedTemplateConfig>(initialTemplate);

export const templateIdAtom = atom<number>(-1);
