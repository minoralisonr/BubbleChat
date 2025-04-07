export interface FriendRequest {
    id: string;
    senderId: string;
    senderUsername?: string;
    recipientId: string;
    status: 'pending' | 'accepted' | 'rejected';
    timestamp?: string;
  }
  
  export interface User {
    id: string;
    username: string;
    email?: string;
  }
  
  export interface FriendsProps {
    user: User;
    setFriends: (friends: User[]) => void;
    onSelectFriend: (friend: User) => void;
  }