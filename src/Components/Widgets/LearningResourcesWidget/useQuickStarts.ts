import { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { QuickStart, QuickStartContext, QuickStartContextValues, filterQuickStarts } from '@patternfly/quickstarts';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

export const API_BASE = '/api/quickstarts/v1';
export const QUICKSTARTS = '/quickstarts';
export const FAVORITES = '/favorites';

export type FavoriteQuickStart = {
  favorite: boolean;
  quickstartName: string;
};

const sortFnc = (q1: QuickStart, q2: QuickStart) => q1.spec.displayName.localeCompare(q2.spec.displayName);

function isFavorite(quickStart: QuickStart, favorites: FavoriteQuickStart[]) {
  return !!favorites.find((f) => f.quickstartName === quickStart.metadata.name);
}

const useQuickStarts = (targetBundle?: string) => {
  const chrome = useChrome();
  const { quickStarts: quickStartsApi } = chrome;
  const [contentReady, setContentReady] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteQuickStart[]>([]);
  const { allQuickStartStates, allQuickStarts = [], filter } = useContext<QuickStartContextValues>(QuickStartContext);

  const state = useMemo(() => {
    const filteredQuickStarts = filterQuickStarts(
      allQuickStarts || [],
      filter?.keyword || '',
      filter?.status?.statusFilters,
      allQuickStartStates || {}
    ).sort(sortFnc);
    return filteredQuickStarts.reduce<{
      bookmarks: QuickStart[];
      documentation: QuickStart[];
      quickStarts: QuickStart[];
      other: QuickStart[];
      learningPaths: QuickStart[];
    }>(
      (acc, curr) => {
        const bookmarked = isFavorite(curr, favorites);
        const data = {
          ...curr,
          metadata: {
            ...curr.metadata,
            favorite: bookmarked,
          },
        };
        if (bookmarked) {
          acc.bookmarks.push(data);
        }
        if (curr.metadata.externalDocumentation) {
          acc.documentation.push(data);
        } else if (curr.metadata.otherResource) {
          acc.other.push(data);
        } else if (curr.metadata.learningPath) {
          acc.learningPaths.push(data);
        } else {
          acc.quickStarts.push(data);
        }

        return acc;
      },
      {
        documentation: [],
        quickStarts: [],
        other: [],
        learningPaths: [],
        bookmarks: [],
      }
    );
  }, [allQuickStarts, filter, favorites]);

  async function fetchData() {
    const user = await chrome.auth.getUser();
    if (!user) {
      throw new Error('User not logged in');
    }

    const account = user.identity.internal?.account_id;

    const quickstartsPath = targetBundle ? `${API_BASE}/${QUICKSTARTS}?bundle=${targetBundle}` : `${API_BASE}/${QUICKSTARTS}?account=${account}`;

    const contentPromise = axios.get<{ data: { content: QuickStart }[] }>(quickstartsPath).then(({ data }) => {
      console.log(data);
      targetBundle
        ? quickStartsApi.set(
            `${targetBundle}`,
            data.data.map(({ content }) => content)
          )
        : quickStartsApi.set(
            `${account}`,
            data.data.map(({ content }) => content)
          );
    });

    const favoritesPromise = account
      ? axios.get<{ data: FavoriteQuickStart[] }>(`${API_BASE}/${FAVORITES}?account=${account}`).then(({ data }) => data.data)
      : Promise.resolve<FavoriteQuickStart[]>([]);

    const promises = [contentPromise, favoritesPromise];
    const [, favorites] = await Promise.allSettled(promises);
    if (favorites.status === 'fulfilled' && favorites.value) {
      setFavorites(favorites.value);
    }

    setContentReady(true);
  }

  useEffect(() => {
    fetchData();
  }, [targetBundle]);

  async function toggleFavorite(quickstartName: string, favorite: boolean) {
    const originalFavorites = [...favorites];
    const newFavorites = favorites.filter((f) => f.quickstartName !== quickstartName);
    if (favorite) {
      newFavorites.push({
        favorite,
        quickstartName,
      });
    }
    setFavorites(newFavorites);

    const user = await chrome.auth.getUser();
    if (!user) {
      throw new Error('User not logged in');
    }

    const account = user.identity.internal?.account_id;

    try {
      await axios.post(`${API_BASE}/${FAVORITES}?account=${account}`, {
        quickstartName,
        favorite,
      });
    } catch (error) {
      // rollback
      console.error('Failed to update favorites', error);
      setFavorites(originalFavorites);
    }
  }

  const cachedState = useMemo(
    () => ({
      ...state,
      contentReady,
      toggleFavorite,
    }),
    [state, contentReady, toggleFavorite]
  );

  return cachedState;
};

export default useQuickStarts;
