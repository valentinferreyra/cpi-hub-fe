import { Route, BrowserRouter, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Space from './pages/Space'
import { Login } from './components/login/Login'
import Post from './pages/Post/Post'
import ComingSoon from './pages/ComingSoon'
import Explore from './pages/Explore'
import { AppProvider } from './context/AppContext'

export const App = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/space/:spaceId" element={<Space />} />
          <Route path="/login" element={<Login />} />
          <Route path="/post/:post_id" element={<Post />} />
          <Route path="/explorar" element={<Explore />} />
          <Route path="/tendencias" element={<ComingSoon title="Tendencias" description="Mantente al día con los temas más populares y trending." />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
