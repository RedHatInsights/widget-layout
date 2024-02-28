import { useState } from 'react';
import useLoaded from './useLoaded';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { ChromeUser } from '@redhat-cloud-services/types';

const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<ChromeUser['identity']['user']>(undefined);
  const [currentToken, setCurrentToken] = useState<string>('');
  const chrome = useChrome();

  const isLoaded = useLoaded(async () => {
    const user = await chrome.auth.getUser();
    if (user) {
      setCurrentUser(user.identity.user);
    }
    const token = await chrome.auth.getToken();
    if (token) {
      setCurrentToken(token);
    }
  });

  return {
    isLoaded,
    currentUser,
    currentToken,
  };
};

export default useCurrentUser;
