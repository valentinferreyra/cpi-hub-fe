import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/users';
import './Auth.css';

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const { token } = await register(name, lastName, email, password, image);
      console.log(token);

      localStorage.setItem('auth_token', token);

      navigate('/');
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
      <div className="auth-box">
        <h2>Registrarse</h2>
        <form className="auth-form" onSubmit={handleRegister}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <div className="form-group">
            <label htmlFor="name" className="form-label">Nombre</label>
            <input
              type="text"
              id="name"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre..."
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName" className="form-label">Apellido</label>
            <input
              type="text"
              id="lastName"
              className="form-input"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Tu apellido..."
              required
            />
          </div>
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
          <div className='form-group'>
            <label htmlFor='image' className='form-label'>URL de imagen de perfil (opcional)</label>
            <input
              type='url'
              id='image'
              className='form-input'
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