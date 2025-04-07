// components/Chat/Chat.js
'use client'

import { useEffect, useState } from 'react'
import Message from '../Message/Message'
import styles from './Chat.module.css'

export default function Chat({ friend }) {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (friend?.id) {
      fetchMessages()
    }
  }, [friend])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?chatId=${friend.id}`)
      const data = await response.json()
      if (response.ok) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {friend && <h2>{friend.username}</h2>}
      </div>
      <div className={styles.messages}>
        {messages.map((message) => (
          <Message key={message._id} message={message} />
        ))}
      </div>
    </div>
  )
}