import React from 'react';
import { BellIcon, CogsIcon, HistoryIcon, OutlinedBookmarkIcon, RocketIcon, StarIcon } from '@patternfly/react-icons';
import RhelIcon from './images/RhelIcon';
import OpenShiftIcon from './images/OpenShiftIcon';
import EdgeIcon from './images/EdgeIcon';
import AnsibleIcon from './images/AnsibleIcon';
import ACSIcon from './images/ACSIcon';
import QuayIcon from './images/QuayIcon';
import OpenShiftAiIcon from './images/OpenShiftAIIcon';
import HeadsetIcon from './images/HeadsetIcon';

const PlaceholderIcon = CogsIcon;

export enum WidgetIcons {
  BellIcon = 'BellIcon',
  HistoryIcon = 'HistoryIcon',
  OutlinedBookmarkIcon = 'OutlinedBookmarkIcon',
  RocketIcon = 'RocketIcon',
  StarIcon = 'StarIcon',
  RhelIcon = 'RhelIcon',
  OpenShiftIcon = 'OpenShiftIcon',
  EdgeIcon = 'EdgeIcon',
  AnsibleIcon = 'AnsibleIcon',
  QuayIcon = 'QuayIcon',
  ACSIcon = 'ACSIcon',
  OpenShiftAiIcon = 'OpenShiftAiIcon',
  HeadsetIcon = 'HeadsetIcon',
}

const iconEnum: { [key in WidgetIcons]: React.ComponentType } = {
  BellIcon,
  HistoryIcon,
  OutlinedBookmarkIcon,
  RocketIcon,
  StarIcon,
  RhelIcon,
  OpenShiftIcon,
  EdgeIcon,
  AnsibleIcon,
  QuayIcon,
  ACSIcon,
  OpenShiftAiIcon,
  HeadsetIcon,
};

const HeaderIcon = ({ icon }: { icon?: string }) => {
  const Icon = iconEnum[icon as WidgetIcons] || PlaceholderIcon;
  return <Icon />;
};

export default HeaderIcon;
