'use client';
import React, { useState, useEffect } from 'react';
import styles from './chat.module.css';

function MessageList({ user, friend }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!user?.id || !friend?.id) return;
    
    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages?sender=${user.id}&recipient=${friend.id}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
    
    // Set up polling for real-time updates
    const intervalId = setInterval(fetchMessages, 5000);
    return () => clearInterval(intervalId);
  }, [user?.id, friend?.id]);

  return (
    <div className={styles.messages}>
      {messages.length === 0 ? (
        <p className={styles.noMessages}>No messages yet. Start the conversation!</p>
      ) : (
        messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`${styles.message} ${msg.sender === user.id ? styles.sentMessage : styles.receivedMessage}`}
          >
            <p>{msg.text}</p>
            <span className={styles.timestamp}>
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

export default MessageList;