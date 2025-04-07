// src/app/chat/Friends.js
'use client';
import React, { useState, useEffect } from 'react';
import styles from './chat.module.css';
import { User, FriendRequest, FriendsProps } from '../types/friends';

function Friends({ user, setFriends, onSelectFriend }) {
  const [inputValue, setInputValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friendResult, setFriendResult] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showRequestsPopup, setShowRequestsPopup] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [localFriends, setLocalFriends] = useState([]);

  // Fetch accepted friends
  const loadFriendList = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/friends/list?userId=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to load requests (status ${response.status})`;
      }
      
      const data = await response.json();
      const validatedFriends = Array.isArray(data) ? data : [];
      
      setLocalFriends(validatedFriends);
      setFriends(validatedFriends);
    } catch (error) {
      console.error('Error fetching friends:', error);
      setFriendResult(error.message || 'Failed to load friends list');
      setLocalFriends([]);
      setFriends([]);
    }
  };

  // Fetch pending requests - UPDATED WITH BETTER ERROR HANDLING
  const loadPendingRequests = async () => {
    if (!user?.id) {
      setPendingRequests([]);
      return;
    }
    
    try {
      const response = await fetch(`/api/friends/requests?userId=${user.id}&status=pending`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      // First check response status before parsing
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to load requests (status ${response.status})`;
        // Special handling for service unavailable
        if (response.status === 503) {
          setFriendResult('Friend requests feature is currently unavailable');
          return [];
        }
        
        throw new Error(errorMessage);
      }

      // Only parse JSON if response is ok
      const responseData = await response.json();
      
      // Handle different response formats safely
      let allRequests = [];
      if (responseData && Array.isArray(responseData.requests)) {
        allRequests = responseData.requests;
      } else if (Array.isArray(responseData)) {
        allRequests = responseData;
      }

      const incomingRequests = allRequests.filter(request => {
        try {
          return request && 
                 typeof request === 'object' && 
                 (request.recipientId === user.id || request.recipient_id === user.id) && 
                 request.status === 'pending';
        } catch (error) {
          console.error('Error filtering requests:', error);
          return false;
        }
      });

      const enhancedRequests = incomingRequests.map(request => ({
        id: request.id,
        senderId: request.senderId || request.sender_id,
        recipientId: request.recipientId || request.recipient_id,
        status: request.status,
        senderUsername: request.senderUsername || request.sender_username || 'Unknown User',
        isIncoming: true
      }));
      
      setPendingRequests(enhancedRequests);
      
    } catch (error) {
      console.error('Error loading pending requests:', error);
      setPendingRequests([]);
      setFriendResult(error.message || 'Failed to load friend requests');
    }
  };

  // Search for users by username or email
  const searchUsers = async () => {
    if (!inputValue.trim()) {
      setFriendResult('Please enter a username or email');
      return;
    }
    
    setIsSearching(true);
    setFriendResult('');
    try {
      const response = await fetch(`/api/friends/search?query=${encodeURIComponent(inputValue)}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Search failed (status ${response.status})`);
      }

      const results = await response.json();
      setSearchResults(Array.isArray(results) ? results : []);
      setFriendResult(results.length ? '' : 'No users found');
    } catch (error) {
      console.error('Search error:', error);
      setFriendResult(error.message || 'Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Add friend
  const addFriend = async (userId) => {
    if (!user?.id) {
      setFriendResult('You must be logged in to add friends');
      return;
    }
  
    if (isAddingFriend) return;
  
    setIsAddingFriend(true);
    setFriendResult('');
  
    try {
      // Optimistic UI update
      setSearchResults(prev => prev.filter(u => u.id !== userId));
      
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senderId: user.id,
          recipientId: userId
        })
      });

      // First check if response is ok before parsing JSON
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }

      // If response is ok, then parse JSON
      const data = await response.json();
  
      // Validate the response data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid server response');
      }

      setFriendResult(data.message || 'Friend request sent successfully!');
      await loadPendingRequests();
  
    } catch (error) {
      console.error('Friend request error:', error);
      
      // Revert optimistic update
      const userToRestore = searchResults.find(u => u.id === userId);
      if (userToRestore) {
        setSearchResults(prev => [...prev, userToRestore]);
      }
      
      // User-friendly error messages
      let errorMessage = 'Failed to send friend request';
      if (error.message.includes('not found')) {
        errorMessage = 'User not found';
      } else if (error.message.includes('already exists')) {
        errorMessage = 'Friend request already pending';
      } else if (error.message.includes('already friends')) {
        errorMessage = 'You are already friends with this user';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setFriendResult(errorMessage);
    } finally {
      setIsAddingFriend(false);
    }
  };

  // Respond to request - UPDATED WITH BETTER ERROR HANDLING
  const respondToRequest = async (requestId, action) => {
    setIsResponding(true);
    try {
      const response = await fetch('/api/friends/respond', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requestId, action })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process request');
      }

      setFriendResult(`Request ${action === 'accept' ? 'accepted' : 'declined'}`);
      await loadPendingRequests();
      await loadFriendList();
      
    } catch (error) {
      console.error('Request response error:', error);
      setFriendResult(error.message || 'Failed to process request');
    } finally {
      setIsResponding(false);
    }
  };

  // Data loading with error boundaries
  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      try {
        await Promise.all([
          loadFriendList(),
          loadPendingRequests()
        ]);
      } catch (error) {
        console.error('Data loading error:', error);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Select friend
  const handleSelectFriend = (friend) => {
    setSelectedFriendId(friend.id);
    onSelectFriend(friend);
  };

  const getButtonText = (userId) => {
    if (localFriends.some(f => f.id === userId)) return 'Added';
    if (pendingRequests.some(r => r.senderId === user.id && r.recipientId === userId)) return 'Requested';
    if (pendingRequests.some(r => r.recipientId === user.id && r.senderId === userId)) return 'Pending';
    return isAddingFriend ? 'Sending...' : 'Add';
  };

  return (
    <div className={styles.friendsSection}>
      <h2>Friends</h2>
      
      <div className={styles.searchSection}>
        <h3>Add Friends <span className={styles.emoji}>👋</span></h3>
        <div className={styles.friendInputContainer}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search by username or email"
            className={styles.friendInput}
            onKeyDown={(e) => e.key === 'Enter' && !isSearching && searchUsers()}
            disabled={isSearching}
          />
          <button 
            onClick={searchUsers} 
            className={styles.searchButton}
            disabled={isSearching || !inputValue.trim()}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className={styles.searchResults}>
            {searchResults.map(resultUser => (
              <div key={resultUser.id} className={styles.searchResultItem}>
                <div>
                  <span className={styles.username}>{resultUser.username}</span>
                  {resultUser.email && (
                    <span className={styles.email}>{resultUser.email}</span>
                  )}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    addFriend(resultUser.id);
                  }}
                  className={styles.addFriendButton}
                  disabled={
                    isAddingFriend ||
                    localFriends.some(f => f.id === resultUser.id) ||
                    pendingRequests.some(r => 
                      (r.senderId === user.id && r.recipientId === resultUser.id) ||
                      (r.recipientId === user.id && r.senderId === resultUser.id)
                    )
                  }
                >
                  {getButtonText(resultUser.id)}
                </button>
              </div>
            ))}
          </div>
        )}
        {friendResult && <p className={styles.friendResult}>{friendResult}</p>}
      </div>
  
      <div className={styles.friendRequests}>
        <h3>Friend Requests <span className={styles.emoji}>🔔</span></h3>
        <button
          className={styles.requestNotificationButton}
          onClick={() => setShowRequestsPopup(true)}
          disabled={isResponding}
        >
          {isResponding ? (
            <span className={styles.loadingText}>Loading...</span>
          ) : (
            `Requests (${pendingRequests.length})`
          )}
        </button>
  
        {showRequestsPopup && (
          <div className={styles.requestsPopup}>
            <div className={styles.popupContent}>
              <h3>Friend Requests</h3>
              {pendingRequests.length === 0 ? (
                <p>No pending requests</p>
              ) : (
                <ul>
                  {pendingRequests.map(request => (
                    <li key={request.id} className={styles.requestItem}>
                      <span>{request.senderUsername}</span>
                      <div>
                        <button 
                          onClick={() => respondToRequest(request.id, 'accept')}
                          disabled={isResponding}
                        >
                          {isResponding ? '...' : 'Accept'}
                        </button>
                        <button 
                          onClick={() => respondToRequest(request.id, 'decline')}
                          disabled={isResponding}
                        >
                          {isResponding ? '...' : 'Decline'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <button onClick={() => setShowRequestsPopup(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
  
      <div className={styles.friendsListSection}>
        <h3>Your Friends <span className={styles.emoji}>👥</span></h3>
        {localFriends.length === 0 ? (
          <p>No friends yet</p>
        ) : (
          <ul className={styles.friendsList}>
            {localFriends.map(friend => (
              <li 
                key={friend.id}
                className={`${styles.friendItem} ${selectedFriendId === friend.id ? styles.selectedFriend : ''}`}
                onClick={() => handleSelectFriend(friend)}
              >
                {friend.username}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Friends;