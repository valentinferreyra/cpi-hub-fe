import { Route, BrowserRouter, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home/Home'
import Space from './pages/Space/Space'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Post from './pages/Post/Post'
import ComingSoon from './pages/ComingSoon/ComingSoon'
import Explore from './pages/Explore/Explore'
import UserView from './pages/UserView/UserView'
import Settings from './pages/Settings/Settings'
import { AppProvider } from './context/AppContext'
import ProtectedRoutes from './utils/ProtectedRoutes'
import SpaceChat from './pages/Chat/SpaceChat'

export const App = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas protegidas */}
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<Home />} />
            <Route path="/space/:spaceId" element={<Space />} />
            <Route path="/space/:spaceId/chat" element={<SpaceChat />} />
            <Route path="/post/:post_id" element={<Post />} />
            <Route path="/explorar" element={<Explore />} />
            <Route path="/users/:userId" element={<UserView />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/tendencias" element={<ComingSoon title="Tendencias" description="Mantente al día con los temas más populares y trending." />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}
