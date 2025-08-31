import { Route, BrowserRouter, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import { Login } from './components/login/Login'
import Post from './pages/Post/Post'
import { AppProvider } from './context/AppContext'

export const App = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/post/:post_id" element={<Post />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
