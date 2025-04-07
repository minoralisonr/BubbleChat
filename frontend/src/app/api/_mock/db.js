// app/api/_mock/db.js

const mockDb = {
  users: [
    { id: '8beb5bf2-8ec2-45b9-9f61-4d9f13b23c3a', username: 'testuser1', email: 'test1@example.com' },
    { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', username: 'testuser2', email: 'test2@example.com' },
    { id: 'a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890', username: 'testuser3', email: 'test3@example.com' },
    { id: '5bb379ed-b483-4cb6-b586-dc820314d5c0', username: 'userA', email: 'usera@example.com' },
    { id: '97527e20-9c0f-45b4-8af1-1cf9ade51d78', username: 'userB', email: 'userb@example.com' }
  ],
  friendRequests: []
};

export const mockDbUtils = {
  // Add this new function to get full user details
  createUser: (userData) => {
    const newUser = {
      id: userData.id || crypto.randomUUID(),
      username: userData.username,
      email: userData.email
    };
    mockDb.users.push(newUser);
    return newUser;
  },
  getUser: (id) => {
    const user = mockDb.users.find(user => user.id === id);
    if (!user) throw new Error('User not found');
    return user;
  },

  findUserById: (id) => mockDb.users.find(user => user.id === id),
  
  findUsersByQuery: (query) => {
    query = query.toLowerCase();
    return mockDb.users.filter(user => 
      user.username.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query)
    ).map(user => ({
      id: user.id,
      username: user.username,
      email: user.email
    }));
  },
  
  getFriendRequests: (userId, status = 'pending') => {
    const allRequests = mockDb.friendRequests.filter(req => 
      req.sender_id === userId || req.recipient_id === userId
    );
  
    const statusFiltered = status 
      ? allRequests.filter(req => req.status === status)
      : allRequests;
  
    return statusFiltered.map(req => {
      const sender = mockDb.users.find(u => u.id === req.sender_id);
      const recipient = mockDb.users.find(u => u.id === req.recipient_id);
      
      return {
        ...req,
        senderUsername: sender?.username || 'Unknown',
        recipientUsername: recipient?.username || 'Unknown',
        isIncoming: req.recipient_id === userId,
        isOutgoing: req.sender_id === userId
      };
    });
  },
  
  getFriendsList: (userId) => {
    const acceptedRequests = mockDb.friendRequests.filter(
      req => (req.sender_id === userId || req.recipient_id === userId) && 
             req.status === 'accepted'
    );
    
    return acceptedRequests.map(req => {
      const friendId = req.sender_id === userId ? req.recipient_id : req.sender_id;
      const friend = mockDb.users.find(user => user.id === friendId);
      return friend ? {
        id: friend.id,
        username: friend.username,
        email: friend.email
      } : null;
    }).filter(Boolean);
  },
  
  createFriendRequest: (senderId, recipientId) => {
    // Enhanced validation
    const senderExists = mockDb.users.some(u => u.id === senderId);
    const recipientExists = mockDb.users.some(u => u.id === recipientId);
    
    if (!senderExists || !recipientExists) {
      throw new Error(`User not found: ${!senderExists ? 'Sender' : 'Recipient'}`);
    }
    
    if (senderId === recipientId) {
      throw new Error('Cannot send friend request to yourself');
    }
    
    const existingRequest = mockDb.friendRequests.find(
      req => (req.sender_id === senderId && req.recipient_id === recipientId) ||
             (req.sender_id === recipientId && req.recipient_id === senderId)
    );
    
    if (existingRequest) {
      if (existingRequest.status === 'accepted') {
        throw new Error('You are already friends with this user');
      }
      throw new Error(existingRequest.sender_id === senderId ? 
        'Friend request already sent' : 
        'This user has already sent you a friend request');
    }
    
    const newRequest = {
      id: Date.now().toString(), // More unique ID
      sender_id: senderId,
      recipient_id: recipientId,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockDb.friendRequests.push(newRequest);
    return newRequest;
  },
  
  respondToRequest: (requestId, action) => {
    const request = mockDb.friendRequests.find(req => req.id === requestId);
    if (!request) {
      throw new Error('Friend request not found');
    }
    
    const newStatus = action === 'accept' ? 'accepted' : 'declined';
    request.status = newStatus;
    request.updated_at = new Date().toISOString();
    
    return request;
  },

  // Preserve existing debug functions
  _getDbSnapshot: () => JSON.parse(JSON.stringify(mockDb)),
  _resetDb: () => {
    mockDb.friendRequests = [];
    console.log('Mock DB reset');
  }
};