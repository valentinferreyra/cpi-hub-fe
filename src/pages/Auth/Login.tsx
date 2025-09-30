import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/users';
import './Auth.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const { token } = await login(email, password);

      localStorage.setItem('auth_token', token);

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
      <div className="auth-box">
        <h2>Iniciar Sesión</h2>
        <form className="auth-form" onSubmit={handleLogin}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu email..."
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              id="password"
              className="form-input"
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