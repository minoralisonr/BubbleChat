'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(false);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission (login or sign-up)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(isLoginForm ? '/api/auth/login' : '/api/auth/signup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          ...(!isLoginForm && { username: formData.username.trim() })
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }

      const data = await response.json();
      localStorage.setItem('user', JSON.stringify({
        ...data.user,
        token: data.token // Make sure your API returns the token
      }));
      // Use router.push instead of window.location.href for client-side navigation
      router.push('/chat'); // Client-side navigation to /chat

    } catch (error) {
      setError(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Theme toggle button */}
      <button 
        className={styles.themeToggle} 
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
      
      {/* Animated bubbles */}
      <div className={styles.bubble}></div>
      <div className={styles.bubble}></div>
      <div className={styles.bubble}></div>
      <div className={styles.bubble}></div>

      <main className={styles.main}>
        <div className={styles.logoContainer}>
          <h1 className={styles.title}>Bubble Chat💬</h1>
        </div>

        {/* Auth container */}
        <div className={styles.authContainer}>
          <div className={styles.formToggle}>
            <button
              className={isLoginForm ? styles.active : ''}
              onClick={() => setIsLoginForm(true)}
              type="button"
              disabled={isLoading}
            >
              Login
            </button>
            <button
              className={!isLoginForm ? styles.active : ''}
              onClick={() => setIsLoginForm(false)}
              type="button"
              disabled={isLoading}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {!isLoginForm && (
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                required
                minLength={3}
                className={styles.input}
                disabled={isLoading}
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className={styles.input}
              disabled={isLoading}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={6}
              className={styles.input}
              disabled={isLoading}
            />
            {error && <p className={styles.error}>{error}</p>}
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className={styles.loadingText}>Logging in...</span>
              ) : (
                isLoginForm ? 'Login' : 'Sign Up'
              )}
            </button>
          </form>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2025 Bubble Chat</p>
      </footer>
    </div>
  );
}