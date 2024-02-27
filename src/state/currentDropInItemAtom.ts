import { atom } from 'jotai';
import { WidgetTypes } from '../Components/Widgets/widgetTypes';

export const currentDropInItemAtom = atom<WidgetTypes | undefined>(undefined);
