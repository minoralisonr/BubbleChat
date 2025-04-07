'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './auth.module.css';

export default function AuthPage() {
  const router = useRouter();
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // New loading state

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
  
    try {
      const endpoint = isLoginForm 
        ? '/api/auth/login' 
        : '/api/auth/signup';
  
      console.log('Submitting to:', endpoint); // Debug log
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          ...(!isLoginForm && { username: formData.username })
        }),
      });
  
      const responseData = await response.json();
      console.log('API Response:', responseData); // Debug log
  
      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }
  
      localStorage.setItem('user', JSON.stringify(responseData));
      router.push('/');
      
    } catch (error) {
      console.error('Full error:', error); // More detailed error log
      setError(
        error.message.includes('Failed to fetch') 
          ? 'Network error - check your connection'
          : error.message || 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className={styles.container}>
      <h1>{isLoginForm ? 'Login' : 'Sign Up'}</h1>
      {error && <p className={styles.error}>{error}</p>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {!isLoginForm && (
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            required
            className={styles.input}
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
        />
        
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? (
            'Processing...'
          ) : (
            isLoginForm ? 'Login' : 'Sign Up'
          )}
        </button>
      </form>

      <p className={styles.toggleText}>
        {isLoginForm ? "Don't have an account? " : "Already have an account? "}
        <button 
          onClick={() => setIsLoginForm(!isLoginForm)} 
          className={styles.toggleButton}
          type="button"
        >
          {isLoginForm ? 'Sign Up' : 'Login'}
        </button>
      </p>
    </div>
  );
}