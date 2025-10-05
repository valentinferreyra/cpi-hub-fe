import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/users';
import cpihubLogo from '../../assets/cpihub-logo.png';
import unqLogo from '../../assets/unq-logo.png';
import './Auth.css';
import { useAppContext } from '../../context/AppContext';

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { fetchData, setCurrentUser } = useAppContext();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const defaultImage = 'https://i.pinimg.com/736x/fb/6c/1f/fb6c1f3561169051c01cfb74d73d93b7.jpg';
      const userImage = image.trim() || defaultImage;

      const { token, user } = await register(name, lastName, email, password, userImage);
      
      localStorage.setItem('auth_token', token);

      if (user) {
        try {
          setCurrentUser(user);
        } catch (err) {
          console.warn('setCurrentUser failed:', err);
        }
      } else {
        try {
          await fetchData();
        } catch (err) {
          console.warn('fetchData after register failed:', err);
        }
      }
      
      try {
        sessionStorage.setItem('showWelcome', '1');
      } catch (e) {
        console.warn('sessionStorage set failed:', e);
      }

      navigate('/explorar');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Error al registrarse');
      } else {
        setError('Error al registrarse');
      }
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
        <h2 className='auth-title'>Registrarse</h2>
        <form className="auth-form" onSubmit={handleRegister}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
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
            <label htmlFor='image' className='auth-form-label'>URL de imagen de perfil (opcional)</label>
            <input
              type='url'
              id='image'
              className='auth-form-input'
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder='URL de tu imagen de perfil...'
            />
          </div>
          <div className='first-time'>¿Ya tienes una cuenta? <span className='auth-link' onClick={() => navigate('/login')}>Inicia sesión</span></div>
          <button
            type="submit"
            className="btn-auth"
            disabled={isLoading}
          >
            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;