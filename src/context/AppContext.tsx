import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import type { User } from '../types/user';
import type { Post } from '../types/post';
import type { Space } from '../types/space';
import { getCurrentUser, getPostsBySpaceId, getSpaceById } from '../api';
import { useUserConnection } from '../hooks/useUserConnection';

interface AppContextType {
  currentUser: User | null;
  selectedSpace: Space | null;
  selectedSpacePosts: Post[];
  isLoading: boolean;
  isFirstLoad: boolean;
  isUsersListCollapsed: boolean;
  isUserOnline: (userId: number) => boolean;
  userConnectionStatus: 'connecting' | 'connected' | 'disconnected';
  fetchData: () => Promise<void>;
  selectSpace: (space: Space) => void;
  goToHome: () => void;
  toggleUsersListCollapse: () => void;
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
  const [isUsersListCollapsed, setIsUsersListCollapsed] = useState(true);
  const location = useLocation();

  const { isUserOnline, connectionStatus: userConnectionStatus } = useUserConnection({ 
    currentUser 
  });

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

      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const user = await getCurrentUser();
          setCurrentUser(user);
        } catch (error) {
          console.error('Error getting current user:', error);
          localStorage.removeItem('auth_token');
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error in data loading:', error);
      setCurrentUser(null);
    } finally {
      if (isFirstLoad) {
        setIsLoading(false);
        setIsFirstLoad(false);
      }
    }
  }, [isFirstLoad]);

  const selectSpace = async (space: Space) => {
    try {
      const completeSpace = await getSpaceById(space.id);
      const posts = await getPostsBySpaceId(space.id);

      setSelectedSpace(completeSpace || space);
      setSelectedSpacePosts(posts);
    } catch (error) {
      console.error('Error fetching space details:', error);
      const posts = await getPostsBySpaceId(space.id);
      setSelectedSpace(space);
      setSelectedSpacePosts(posts);
    }
  };

  const goToHome = () => {
    setSelectedSpace(null);
    setSelectedSpacePosts([]);
  };

  const toggleUsersListCollapse = () => {
    setIsUsersListCollapsed(prev => !prev);
  };

  // Execute fetchData on first load
  useEffect(() => {
    fetchData();
  }, []); 

  useEffect(() => {
    const width = isUsersListCollapsed ? '60px' : '280px';
    document.documentElement.style.setProperty('--users-list-width', width);
  }, [isUsersListCollapsed]);

  const value = {
    currentUser,
    selectedSpace,
    selectedSpacePosts,
    isLoading,
    isFirstLoad,
    isUsersListCollapsed,
    isUserOnline,
    userConnectionStatus,
    fetchData,
    selectSpace,
    goToHome,
    toggleUsersListCollapse,
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
