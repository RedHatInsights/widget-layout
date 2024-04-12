import { isEqual } from 'lodash';
import { atom } from 'jotai';
import { ExtendedLayoutItem, Variants } from '../api/dashboard-templates';

export const initialLayout: ExtendedLayoutItem[] = [];

export function isDefaultLayout(layout: ExtendedLayoutItem[]) {
  return isEqual(initialLayout, layout);
}

export const layoutVariantAtom = atom<Variants>('xl');

export const layoutAtom = atom<ExtendedLayoutItem[]>(initialLayout);

export const activeItemAtom = atom<string | undefined>(undefined);
