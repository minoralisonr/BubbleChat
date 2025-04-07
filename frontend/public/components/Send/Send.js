'use client'

import { useState } from 'react'
import styles from './Send.module.css'

export default function Send({ friend, onMessageSent }) {
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim() || !friend) return

    try {
      const senderId = localStorage.getItem('userId')
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message,
          senderId,
          receiverId: friend._id,
          chatId: `${senderId}-${friend._id}`
        }),
      })

      if (response.ok) {
        setMessage('')
        if (onMessageSent) onMessageSent()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className={styles.input}
      />
      <button type="submit" className={styles.button}>
        Send
      </button>
    </form>
  )
}