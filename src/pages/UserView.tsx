import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Topbar from '../components/Topbar/Topbar';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import UserPosts from '../components/UserPosts/UserPosts';
import UserComments from '../components/UserComments/UserComments';
import { useAppContext } from '../context/AppContext';
import { getUserById, getUserPosts, getUserComments } from '../api';
import type { User } from '../types/user';
import LogoutModal from '../components/LogoutModal/LogoutModal';
import './UserView.css';

const UserView: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { currentUser, isLoading, fetchData } = useAppContext();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalComments, setTotalComments] = useState(0);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          setIsLoadingUser(true);
          const userData = await getUserById(parseInt(userId));
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user:', error);
          navigate('/');
        } finally {
          setIsLoadingUser(false);
        }
      }
    };

    fetchUserData();
  }, [userId, navigate]);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (userId) {
        try {
          // Obtener total de posts
          const postsResponse = await getUserPosts(parseInt(userId), 1, 1);
          setTotalPosts(postsResponse.total || 0);

          // Obtener total de comentarios
          const commentsResponse = await getUserComments(parseInt(userId), 1, 1);
          setTotalComments(commentsResponse.total || 0);
        } catch (error) {
          console.error('Error fetching user stats:', error);
        }
      }
    };

    fetchUserStats();
  }, [userId]);

  const handleSpaceClick = (spaceId: number) => {
    navigate(`/space/${spaceId}`);
  };

  const handleLogOut = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  }

  if (isLoading || isLoadingUser) {
    return (
      <div className="user-view-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Cargando perfil...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-view-page">
        <div className="error-container">
          <h2>Usuario no encontrado</h2>
          <p>El usuario que buscas no existe o no está disponible.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Inicio', path: '/' },
    { label: `${user.name} ${user.last_name}`, path: `/users/${user.id}` }
  ];

  return (
    <div className="user-view-page">
      <Topbar currentUser={currentUser} />
      <Sidebar spaces={currentUser?.spaces || []} onSpaceClick={() => { }} />

      <div className="user-view-container">
        <Breadcrumb items={breadcrumbItems} />

        <div className="user-profile-section">
          <div className="user-profile-header">
            <div className="user-profile-avatar">
              {user.image ? (
                <img src={user.image} alt={`${user.name} ${user.last_name}`} className="user-profile-image" />
              ) : (
                <div className="user-profile-avatar-placeholder">
                  {user.name.charAt(0)}{user.last_name.charAt(0)}
                </div>
              )}
            </div>

            <div className="user-info">
              <div className="user-info-header">
                <h1 className="user-name">
                  {user.name} {user.last_name}
                </h1>
                {currentUser && currentUser.id === user.id && (
                  <div className="space-settings-container" ref={settingsRef}>
                    <img
                      src="/src/assets/settings.png"
                      alt="Configuración"
                      className="space-settings-icon"
                      onClick={() => setShowSettings(!showSettings)}
                    />
                    {showSettings && (
                      <div className="space-settings-dropdown">
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            setShowSettings(false);
                            setIsLogoutModalOpen(true);
                          }}
                        >
                          Cerrar sesión
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="user-email">{user.email}</p>

              <div className="user-stats">
                <div className="stat-item">
                  <span className="stat-number">{totalPosts}</span>
                  <span className="stat-label">Posts</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{totalComments}</span>
                  <span className="stat-label">Comentarios</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{user.spaces.length}</span>
                  <span className="stat-label">Spaces</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="user-spaces-section">
          <h3>Spaces de interés</h3>
          <div className="carousel-container">
            <div className="carousel-scroll">
              {user.spaces.map((space) => (
                <div
                  key={space.id}
                  className="space-card"
                  onClick={() => handleSpaceClick(space.id)}
                >
                  <div className="space-card-header">
                    <h3 className="space-card-name">{space.name}</h3>
                  </div>
                  <p className="space-card-description">{space.description}</p>
                  <div className="space-card-footer">
                    <span className="space-card-creator">
                      Creado: {new Date(space.created_at).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <UserPosts userId={user.id} userName={user.name} />

        <UserComments userId={user.id} userName={user.name} />
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          handleLogOut();
          setIsLogoutModalOpen(false);
        }}
      />
    </div>
  );
};

export default UserView;