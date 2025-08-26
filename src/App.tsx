import './App.css'
import { useEffect, useState } from 'react'
import Topbar from './components/Topbar/Topbar'
import Sidebar from './components/Sidebar/Sidebar'
import { getCurrentUser } from './services/api'
import type { User } from './types/user'

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // beforeRender 
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        // Usuario obtenido correctamente
      } catch (error) {
        console.error('Error obteniendo usuario actual:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  return (
    <div className="App">
      <Topbar currentUser={currentUser} />
      <Sidebar />
    </div>
  )
}

export default App
