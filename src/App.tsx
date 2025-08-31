import { Route, BrowserRouter, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import { Login } from './components/login/Login'
import Post from './pages/Post/Post'

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/posts/:post_id" element={<Post />} />
      </Routes>
    </BrowserRouter>
  )
}
