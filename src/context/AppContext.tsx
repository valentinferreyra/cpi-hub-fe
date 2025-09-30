import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import type { User } from '../types/user';
import type { Post } from '../types/post';
import type { Space } from '../types/space';
import { getCurrentUser, getPostsBySpaceId, getSpaceById } from '../services/api';

interface AppContextType {
  currentUser: User | null;
  selectedSpace: Space | null;
  selectedSpacePosts: Post[];
  isLoading: boolean;
  isFirstLoad: boolean;
  fetchData: () => Promise<void>;
  selectSpace: (space: Space) => void;
  goToHome: () => void;
  setCurrentUser: (user: User | null) => void;
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
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [selectedSpacePosts, setSelectedSpacePosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const location = useLocation();

  // Clear selectedSpace when navigating away from space routes
  useEffect(() => {
    const isSpaceRoute = location.pathname.startsWith('/space/');
    if (!isSpaceRoute && selectedSpace) {
      setSelectedSpace(null);
      setSelectedSpacePosts([]);
    }
  }, [location.pathname, selectedSpace]);

  const fetchData = useCallback(async () => {
    try {
      if (isFirstLoad) {
        setIsLoading(true);
      }

      const user = await getCurrentUser(1);
      setCurrentUser(user);

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
    selectedSpace,
    selectedSpacePosts,
    isLoading,
    isFirstLoad,
    fetchData,
    selectSpace,
    goToHome,
    setCurrentUser,
    setSelectedSpace,
    setSelectedSpacePosts,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
