import { PortalNotificationConfig } from '@redhat-cloud-services/frontend-components-notifications/Portal';
import { atom, useSetAtom } from 'jotai';

export const notificationsAtom = atom(<PortalNotificationConfig[]>[]);

export const useAddNotification = () => {
  const setNotifications = useSetAtom(notificationsAtom);

  function addNotifications(notification: Omit<PortalNotificationConfig, 'id'>) {
    const uuid = crypto.randomUUID();
    setNotifications((prevNotifications) => [...prevNotifications, { ...notification, id: uuid }]);

    return uuid;
  }

  return addNotifications;
};

export const useRemoveNotification = () => {
  const setNotifications = useSetAtom(notificationsAtom);

  function removeNotifications(id: number | string) {
    setNotifications((prevNotifications) => prevNotifications.filter((notification) => notification.id !== id));
  }

  return removeNotifications;
};
