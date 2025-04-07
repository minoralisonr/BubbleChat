import styles from './Message.module.css'

export default function Message({ message }) {
  const isOwnMessage = message.senderId === localStorage.getItem('userId')

  return (
    <div className={`${styles.message} ${isOwnMessage ? styles.own : ''}`}>
      <div className={styles.bubble}>
        {message.content}
        <span className={styles.time}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  )
}