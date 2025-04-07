'use client'

import { useEffect, useState } from 'react'
import styles from './Friends.module.css'

export default function Friends({ onSelectFriend }) {
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFriends()
  }, [])

  const fetchFriends = async () => {
    try {
      const userId = localStorage.getItem('userId')
      const response = await fetch(`/api/friends?userId=${userId}`)
      const data = await response.json()
      
      if (response.ok) {
        setFriends(data.friends)
      }
    } catch (error) {
      console.error('Failed to fetch friends:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading friends...</div>
  }

  return (
    <div className={styles.container}>
      <h2>Friends</h2>
      <div className={styles.friendsList}>
        {friends.map((friend) => (
          <div
            key={friend._id}
            className={styles.friendItem}
            onClick={() => onSelectFriend(friend)}
          >
            <div className={styles.friendName}>{friend.username}</div>
            {friend.isOnline && <div className={styles.onlineStatus} />}
          </div>
        ))}
      </div>
    </div>
  )
}