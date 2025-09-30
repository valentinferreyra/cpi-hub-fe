import { Route, BrowserRouter, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Space from './pages/Space'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Post from './pages/Post/Post'
import ComingSoon from './pages/ComingSoon'
import Explore from './pages/Explore'
import UserView from './pages/UserView'
import { AppProvider } from './context/AppContext'

export const App = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/space/:spaceId" element={<Space />} />
          <Route path="/post/:post_id" element={<Post />} />
          <Route path="/explorar" element={<Explore />} />
          <Route path="/users/:userId" element={<UserView />} />
          <Route path="/tendencias" element={<ComingSoon title="Tendencias" description="Mantente al día con los temas más populares y trending." />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}
