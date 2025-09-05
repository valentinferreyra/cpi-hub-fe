import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '../types/user';
import type { Post } from '../types/post';
import type { Space } from '../types/space';
import { mockCurrentUser } from '../data/mockCurrentUser';
import { getPostsBySpaceIds } from '../services/api';
import { mockGetSpace } from '../data/mockGetSpace';
import { mockGetPostsBySpace } from '../data/mockGetPostsBySpace';

interface AppContextType {
  currentUser: User | null;
  latestPosts: Post[];
  selectedSpace: Space | null;
  selectedSpacePosts: Post[];
  isLoading: boolean;
  isFirstLoad: boolean;
  fetchData: () => Promise<void>;
  selectSpace: (space: Space) => void;
  goToHome: () => void;
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
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [selectedSpacePosts, setSelectedSpacePosts] = useState<Post[]>([]);
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

  const selectSpace = (_space: Space) => {
    setSelectedSpace(mockGetSpace); // Siempre devuelve el mismo space mockeado
    setSelectedSpacePosts(mockGetPostsBySpace); // Siempre devuelve los mismos posts mockeados
  };

  const goToHome = () => {
    setSelectedSpace(null);
    setSelectedSpacePosts([]);
  };

  const value = {
    currentUser,
    latestPosts,
    selectedSpace,
    selectedSpacePosts,
    isLoading,
    isFirstLoad,
    fetchData,
    selectSpace,
    goToHome,
    setCurrentUser,
    setLatestPosts,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
