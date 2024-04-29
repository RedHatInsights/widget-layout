import { atom } from 'jotai';
import { Variants } from '../api/dashboard-templates';

export const layoutVariantAtom = atom<Variants>('xl');

export const activeItemAtom = atom<string | undefined>(undefined);
