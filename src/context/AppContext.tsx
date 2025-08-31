import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '../types/user';
import type { Post } from '../types/post';
import { mockCurrentUser } from '../data/mockCurrentUser';
import { getPostsBySpaceIds } from '../services/api';

interface AppContextType {
  currentUser: User | null;
  latestPosts: Post[];
  isLoading: boolean;
  isFirstLoad: boolean;
  fetchData: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  setLatestPosts: (posts: Post[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const fetchData = async () => {
    try {
      if (isFirstLoad) {
        setIsLoading(true);
      }

      const user = mockCurrentUser;
      setCurrentUser(user);

      if (user.spaces && user.spaces.length > 0) {
        const spaceIds = user.spaces.map(space => space.id);
        const posts = await getPostsBySpaceIds(spaceIds);
        setLatestPosts(posts);
      }

    } catch (error) {
      console.error('Error en la carga de datos:', error);
    } finally {
      if (isFirstLoad) {
        setIsLoading(false);
        setIsFirstLoad(false);
      }
    }
  };

  const value = {
    currentUser,
    latestPosts,
    isLoading,
    isFirstLoad,
    fetchData,
    setCurrentUser,
    setLatestPosts,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
