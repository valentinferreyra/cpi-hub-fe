import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User } from '../types/user';
import type { Post } from '../types/post';
import type { Space } from '../types/space';
import { getCurrentUser, getPostsBySpaceId, getPostsByUserId, getSpaceById } from '../services/api';

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
  setSelectedSpace: (space: Space | null) => void;
  setSelectedSpacePosts: (posts: Post[] | ((prevPosts: Post[]) => Post[])) => void;
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

  const fetchData = useCallback(async () => {
    try {
      if (isFirstLoad) {
        setIsLoading(true);
      }

      const user = await getCurrentUser(1);
      setCurrentUser(user);

      // Obtener posts de todos los espacios del usuario usando el nuevo endpoint
      const posts = await getPostsByUserId(1);
      setLatestPosts(posts);

    } catch (error) {
      console.error('Error en la carga de datos:', error);
    } finally {
      if (isFirstLoad) {
        setIsLoading(false);
        setIsFirstLoad(false);
      }
    }
  }, [isFirstLoad]);

  const selectSpace = async (space: Space) => {
    try {
      // Fetch complete space details with author information
      const completeSpace = await getSpaceById(space.id);
      const posts = await getPostsBySpaceId(space.id);

      // Use the complete space data if available, otherwise fall back to the space from user's spaces
      setSelectedSpace(completeSpace || space);
      setSelectedSpacePosts(posts);
    } catch (error) {
      console.error('Error fetching space details:', error);
      // Fallback to the original space data if API call fails
      const posts = await getPostsBySpaceId(space.id);
      setSelectedSpace(space);
      setSelectedSpacePosts(posts);
    }
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
    setSelectedSpace,
    setSelectedSpacePosts,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
