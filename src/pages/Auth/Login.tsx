import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/users';
import cpihubLogo from '../../assets/cpihub-logo.png';
import unqLogo from '../../assets/unq-logo.png';
import './Auth.css';
import { useAppContext } from '../../context/AppContext';


function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { fetchData, setCurrentUser } = useAppContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const { token, user } = await login(email, password);

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

      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Error al iniciar sesión');
      } else {
        setError('Error al iniciar sesión');
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
        <h2 className='auth-title'>Iniciar Sesión</h2>
        <form className="auth-form login-form" onSubmit={handleLogin}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
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
          <div className='first-time'>¿Primera vez aquí? <span className='auth-link' onClick={() => navigate('/register')}>Regístrate</span></div>
          <button
            type="submit"
            className="btn-auth"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;