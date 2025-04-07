'use client';
import React, { useState } from 'react';
import styles from './chat.module.css';

function Send({ user, friend, onMessageSent }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim() || !user?.id || !friend?.id) return;
    
    setSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: user.id,
          recipient: friend.id,
          text: message,
          timestamp: new Date().toISOString(),
        }),
      });
      
      if (response.ok) {
        setMessage('');
        // Call callback to update message list in parent component
        if (onMessageSent) {
          const newMessage = await response.json();
          onMessageSent(newMessage);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to send message:', errorData);
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Network error. Please check your connection.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={styles.messageInput}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder={friend ? `Message ${friend.username}...` : "Select a friend to chat with..."}
        disabled={!friend || sending}
        aria-label="Message input"
        className={styles.messageInputField}
      />
      <button 
        onClick={handleSendMessage} 
        disabled={!message.trim() || !friend || sending}
        className={`${styles.sendButton} ${(!message.trim() || !friend) ? styles.disabled : ''}`}
      >
        {sending ? '...' : 'Send'}
      </button>
    </div>
  );
}

export default Send;