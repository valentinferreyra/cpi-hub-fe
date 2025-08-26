import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import { useState, useEffect } from "react";
import type { User } from "../types/user";
import { getCurrentUser } from "../services/api";

function Home() {

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
    <>
      <Topbar currentUser={currentUser} />
      <Sidebar />
    </>
  )

}

export default Home;
