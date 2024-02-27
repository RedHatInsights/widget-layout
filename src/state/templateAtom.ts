import { atom } from 'jotai';
import { ExtendedTemplateConfig } from '../api/dashboard-templates';

export const activeTemplateIdAtom = atom<number>(-1);

export const initialTemplate: ExtendedTemplateConfig = { sm: [], md: [], lg: [], xl: [] };

export const templateAtom = atom<ExtendedTemplateConfig>(initialTemplate);
