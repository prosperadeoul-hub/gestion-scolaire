import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const result = await login(username, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-card__title">Connexion SGS</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <p className="login-form__error">{error}</p>}
          <input
            type="text"
            className="login-form__input"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            className="login-form__input"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-form__button">
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
