import { Route, BrowserRouter, Routes } from 'react-router'
import './App.css'
import Home from './pages/Home'
import { Login } from './components/login/Login'

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}
