import { Route, BrowserRouter, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import './App.css'
import Home from './pages/Home/Home'
import Space from './pages/Space/Space'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Post from './pages/Post/Post'
import Explore from './pages/Explore/Explore'
import UserView from './pages/UserView/UserView'
import Settings from './pages/Settings/Settings'
import { AppProvider } from './context/AppContext'
import { ErrorNotificationProvider, useErrorNotification } from './context/ErrorNotificationContext'
import { setErrorHandler } from './api/client'
import ErrorNotification from './components/ErrorNotification/ErrorNotification'
import ProtectedRoutes from './utils/ProtectedRoutes'
import SpaceChat from './pages/Chat/SpaceChat'
import Trends from './pages/Trends/Trends'

const AppContent = () => {
  const { showError } = useErrorNotification();

  useEffect(() => {
    setErrorHandler(showError);
  }, [showError]);

  return (
    <>
      <ErrorNotification />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<Home />} />
          <Route path="/space/:spaceId" element={<Space />} />
          <Route path="/space/:spaceId/chat" element={<SpaceChat />} />
          <Route path="/post/:post_id" element={<Post />} />
          <Route path="/explorar" element={<Explore />} />
          <Route path="/users/:userId" element={<UserView />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/tendencias" element={<Trends />} />
        </Route>
      </Routes>
    </>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <ErrorNotificationProvider>
          <AppContent />
        </ErrorNotificationProvider>
      </AppProvider>
    </BrowserRouter>
  )
}
