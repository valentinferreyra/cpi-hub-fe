import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@components/Sidebar/Sidebar';
import Topbar from '@components/Topbar/Topbar';
import Breadcrumb from '@components/Breadcrumb/Breadcrumb';
import { useAppContext } from '../../context/AppContext';
import { updateUser } from '../../api';
import './Settings.css';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isLoading, fetchData } = useAppContext();
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [image, setImage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setLastName(currentUser.last_name);
      setImage(currentUser.image || '');
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const changed =
        name !== currentUser.name ||
        lastName !== currentUser.last_name ||
        image !== (currentUser.image || '');
      setHasChanges(changed);
    }
  }, [name, lastName, image, currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    try {
      setIsSaving(true);
      setSaveMessage(null);

      const updateData: {
        id: number;
        name?: string;
        last_name?: string;
        image?: string;
      } = { id: currentUser.id };

      if (name !== currentUser.name) {
        updateData.name = name;
      }
      if (lastName !== currentUser.last_name) {
        updateData.last_name = lastName;
      }
      if (image !== (currentUser.image || '')) {
        updateData.image = image;
      }

      await updateUser(updateData);
      await fetchData(); // Refrescar datos del usuario

      setSaveMessage({ type: 'success', text: 'Cambios guardados correctamente' });
      setHasChanges(false);

      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving user data:', error);
      setSaveMessage({ type: 'error', text: 'Error al guardar los cambios. Intenta nuevamente.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (currentUser) {
      setName(currentUser.name);
      setLastName(currentUser.last_name);
      setImage(currentUser.image || '');
      setHasChanges(false);
      setSaveMessage(null);
    }
  };

  if (isLoading) {
    return (
      <div className="settings-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="settings-page">
        <div className="error-container">
          <h2>No autorizado</h2>
          <p>Debes iniciar sesión para acceder a esta página.</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Ajustes', path: '/settings' }
  ];

  return (
    <div className="settings-page">
      <Topbar currentUser={currentUser} />
      <Sidebar spaces={currentUser?.spaces || []} onSpaceClick={() => { }} />

      <div className="settings-container">
        <Breadcrumb items={breadcrumbItems} />

        <div className="settings-content">
          <div className="settings-header">
            <h1>Ajustes de perfil</h1>
            <p className="settings-subtitle">Actualiza tu información personal</p>
          </div>

          <form onSubmit={handleSave} className="settings-form">
            <div className="settings-section">
              <h2>Información personal</h2>

              <div className="form-group">
                <label htmlFor="name">Nombre</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Apellido</label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Tu apellido"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={currentUser.email}
                  disabled
                  className="input-disabled"
                />
                <small className="form-help">El email no puede ser modificado</small>
              </div>

              <div className="form-group">
                <label htmlFor="image">URL de imagen de perfil</label>
                <div className="image-input-container">
                  <input
                    id="image"
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://ejemplo.com/mi-imagen.jpg"
                  />
                  {image && (
                    <div className="preview-avatar">
                      <img src={image} alt="Preview" onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }} />
                    </div>
                  )}
                </div>
                <small className="form-help">Ingresa la URL de tu imagen de perfil</small>
              </div>
            </div>

            {saveMessage && (
              <div className={`save-message ${saveMessage.type}`}>
                {saveMessage.text}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
                disabled={!hasChanges || isSaving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
