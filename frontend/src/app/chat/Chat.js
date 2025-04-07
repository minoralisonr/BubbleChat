'use client';
import React, { useState } from 'react';
import Friends from './Friends';
import MessageList from './MessageList';
import Send from './Send';
import styles from './chat.module.css';

function Chat({ user }) {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);

  const handleMessageSent = (newMessage) => {
    setMessages(prevMessages => [...prevMessages, newMessage]);
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.sidePanel}>
        <Friends 
          user={user} 
          setFriends={setFriends} 
          onSelectFriend={setSelectedFriend} 
        />
      </div>
      
      <div className={styles.chatBox}>
        {selectedFriend ? (
          <>
            <div className={styles.chatHeader}>
              <h2>Chatting with {selectedFriend.username}</h2>
            </div>
            
            <MessageList user={user} friend={selectedFriend} messages={messages} />
            
            <Send 
              user={user} 
              friend={selectedFriend} 
              onMessageSent={handleMessageSent} 
            />
          </>
        ) : (
          <div className={styles.noChatSelected}>
            <p>Get started and add a friend to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;