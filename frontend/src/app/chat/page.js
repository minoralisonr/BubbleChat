//src/app/chat/page.js
// Do not modify this file anymore unless necessary.
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Chat from './Chat';
import Friends from './Friends'; // ADD THIS IMPORT
import styles from './chat.module.css';
// import ErrorBoundary from '../components/ErrorBoundary';

export default function Page() {
  const [user, setUser] = useState(null); // Changed from {username: 'Guest'}
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const router = useRouter();
  const [isBubbling, setIsBubbling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. First check localStorage for user data
        const localUser = JSON.parse(localStorage.getItem('user'));
        if (localUser) {
          setUser(localUser);
        }

        // 2. Then verify with the server
        const userResponse = await fetch('/api/auth/user', {
          credentials: 'include'
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          
          //Only fetch friends if we have a user ID
          const friendsResponse = await fetch(`/api/friends/list?userId=${userData.id}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }});
          if (friendsResponse.ok) {
            setFriends(await friendsResponse.json());
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const onSelectFriend = (friend) => {
    setSelectedFriend(friend);
  };
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        localStorage.removeItem('user');
        setUser(null);
        router.push('/'); // Redirect to login page
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Bubbling...</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
      <h1 
          className={`${styles.title} ${isBubbling ? styles.bubbleEffect : ''}`}
          onMouseEnter={() => {
            setIsBubbling(true);
            setTimeout(() => setIsBubbling(false), 2000); // Effect lasts 2 seconds
          }}
        >
          Bubble Chat 🫧
        </h1>
        <div className={styles.userInfo}>
          {user ? (
            <>
              Hi {user.username}!
              <button 
                onClick={handleLogout}
                className={styles.logoutButton}
              >
                Logout
              </button>
            </>
          ) : (
            <button 
              onClick={() => router.push('/')}
              className={styles.loginButton}
            >
              Login
            </button>
          )}
        </div>
      </header>
      
      <main className={styles.main}>
        <Chat 
          user={user} 
          friends={friends}
          selectedFriend={selectedFriend}
          onSelectFriend={setSelectedFriend}
          messages={messages}
        />
        
        {selectedFriend && (
          <div className={styles.messageInputContainer}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Message ${selectedFriend.username}`}
              className={styles.messageInput}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className={styles.sendButton}
              disabled={!message.trim()}
            >
              Send
            </button>
          </div>
        )} 
      </main>
      {/* <ErrorBoundary fallback={<div>Failed to load friends list.</div>}>
        <Friends 
          user={user} 
          setFriends={setFriends} 
          onSelectFriend={onSelectFriend} 
        />
      </ErrorBoundary> */}
      <footer className={styles.footer}>
        <p>© 2025 Bubble Chat</p>
      </footer>
    </div>
  );
}