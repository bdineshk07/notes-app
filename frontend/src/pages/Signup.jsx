import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api/auth';
import './Auth.css';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await signup(email, password);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">The Digital Curator</div>

        <div>
          <div className="auth-hero">
            Your thoughts,<br />curated with<br />precision.
          </div>
          <div className="auth-hero-sub">
            Experience an editorial approach to note-taking. Designed for
            clarity, speed, and the refined organization of your digital legacy.
          </div>

          <div className="auth-feature-grid">
            <div className="auth-feature-card">
              <div>✨</div>
              <div className="auth-feature-label">INTELLIGENT</div>
            </div>
            <div className="auth-feature-card">
              <div>📝</div>
              <div className="auth-feature-label">MINIMAL</div>
            </div>
          </div>
        </div>

        <div className="auth-spotlight">
          <div className="auth-spotlight-label">USER SPOTLIGHT</div>
          "The first app that respects the hierarchy of my ideas."
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrapper">
          <h1 className="auth-title">Create your sanctuary</h1>
          <p className="auth-subtitle">
            Join a community of thoughtful curators.
          </p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">EMAIL ADDRESS</label>
              <input
                type="email"
                className="auth-input"
                placeholder="evelyn@curator.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">PASSWORD</label>
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">CONFIRM PASSWORD</label>
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            Already part of the collection? <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;