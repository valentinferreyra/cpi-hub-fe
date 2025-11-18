import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/users';
import cpihubLogo from '../../assets/cpihub-logo.png';
import unqLogo from '../../assets/unq-logo.png';
import { convertFileToBase64 } from '../../utils/imageUtils';
import './Auth.css';
import { useAppContext } from '../../context/AppContext';

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [uploadType, setUploadType] = useState<'url' | 'file'>('url');
  const [urlValue, setUrlValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fetchData, setCurrentUser } = useAppContext();

  const handleImageChange = (imageData: string | null) => {
    setImage(imageData || '');
  };

  // Función para verificar si el formulario es válido
  const isFormValid = () => {
    return name.trim() && lastName.trim() && email.trim() && password.trim() && password.trim().length >= 6;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await convertFileToBase64(file);
        handleImageChange(base64);
        setShowImageModal(false);
      } catch (error) {
        console.error('Error converting file to base64:', error);
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return;
    }

    if (password.trim().length < 6) {
      return;
    }

    try {
      setIsLoading(true);

      const defaultImage = 'https://i.pinimg.com/736x/fb/6c/1f/fb6c1f3561169051c01cfb74d73d93b7.jpg';
      const userImage = image.trim() || defaultImage;

      const { token, user } = await register(name, lastName, email, password, userImage);

      localStorage.setItem('auth_token', token);

      try {
        await fetchData();
      } catch (err) {
        console.warn('fetchData after register failed:', err);
        if (user) {
          try {
            setCurrentUser(user);
          } catch (setUserErr) {
            console.warn('setCurrentUser failed:', setUserErr);
          }
        }
      }

      try {
        sessionStorage.setItem('showWelcome', '1');
      } catch (e) {
        console.warn('sessionStorage set failed:', e);
      }

      navigate('/explorar');
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-logos">
        <img src={unqLogo} alt="Logo UNQ" />
        <img src={cpihubLogo} alt="Logo CPIHub" />
      </div>
      <div className="auth-box">
        <form className="auth-form" onSubmit={handleRegister}>
          <div className="auth-form-row">
            <div className="auth-form-group">
              <label htmlFor="name" className="auth-form-label">Nombre</label>
              <input
                type="text"
                id="name"
                className="auth-form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre..."
                required
              />
            </div>
            <div className="auth-form-group">
              <label htmlFor="lastName" className="auth-form-label">Apellido</label>
              <input
                type="text"
                id="lastName"
                className="auth-form-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Tu apellido..."
                required
              />
            </div>
          </div>
          <div className="auth-form-group">
            <label htmlFor="email" className="auth-form-label">Email</label>
            <input
              type="email"
              id="email"
              className="auth-form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu email..."
              required
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="password" className="auth-form-label">Contraseña</label>
            <input
              type="password"
              id="password"
              className="auth-form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña..."
              required
            />
          </div>
          <div className='auth-form-group'>
            <label className='auth-form-label'>Imagen de perfil (opcional)</label>
            <div className="auth-image-upload">
              <button
                type="button"
                className="auth-image-btn"
                onClick={() => setShowImageModal(true)}
                disabled={isLoading}
              >
                <span className="auth-image-btn-text">
                  {image ? 'Cambiar imagen' : 'Seleccionar imagen o URL'}
                </span>
              </button>
              {image && (
                <div className="auth-image-preview">
                  <img src={image} alt="Preview" className="auth-image-preview-img" />
                  <button
                    type="button"
                    className="auth-image-remove"
                    onClick={() => setImage('')}
                    disabled={isLoading}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            
            {showImageModal && (
              <div className="auth-image-modal-overlay" onClick={() => setShowImageModal(false)}>
                <div className="auth-image-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="auth-image-modal-header">
                    <h3>Seleccionar imagen de perfil</h3>
                    <button 
                      className="auth-image-modal-close"
                      onClick={() => setShowImageModal(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="auth-image-modal-content">
                    <div className="auth-image-upload-simple">
                      <div className="auth-image-upload-tabs">
                        <button
                          type="button"
                          className={`auth-image-tab ${uploadType === 'url' ? 'active' : ''}`}
                          onClick={() => setUploadType('url')}
                        >
                          URL
                        </button>
                        <button
                          type="button"
                          className={`auth-image-tab ${uploadType === 'file' ? 'active' : ''}`}
                          onClick={() => setUploadType('file')}
                        >
                          Archivo
                        </button>
                      </div>
                      
                      {uploadType === 'url' ? (
                        <div className="auth-image-url-input">
                          <input
                            type="url"
                            placeholder="Pega la URL de la imagen..."
                            value={urlValue}
                            onChange={(e) => setUrlValue(e.target.value)}
                            className="auth-image-url-field"
                          />
                          <button
                            type="button"
                            className="auth-image-confirm-btn"
                            onClick={() => {
                              if (urlValue.trim()) {
                                handleImageChange(urlValue.trim());
                                setShowImageModal(false);
                              }
                            }}
                            disabled={!urlValue.trim()}
                          >
                            Usar URL
                          </button>
                        </div>
                      ) : (
                        <div className="auth-image-file-input">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="auth-image-file-field"
                          />
                          <button
                            type="button"
                            className="auth-image-file-btn"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Seleccionar archivo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className='first-time'>¿Ya tienes una cuenta? <span className='auth-link' onClick={() => navigate('/login')}>Inicia sesión</span></div>
          <button
            type="submit"
            className="btn-auth"
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;