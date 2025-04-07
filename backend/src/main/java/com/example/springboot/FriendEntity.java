package com.example.springboot;

import jakarta.persistence.*;

import java.util.UUID;

@Entity

@IdClass(FriendKey.class)
@Table(name = "friends")
public class FriendEntity {
    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Id
    @Column(name = "friend_id")
    private UUID friendId;

    @Column(name = "status")
    private String status; // "pending" or "accepted"
    
    @Column(name = "sender_username")
    private String senderUsername;

    public FriendEntity(UUID userId, UUID friendId, String status, String senderUsername) {
        this.userId = userId;
        this.friendId = friendId;
        this.status = status;
        this.senderUsername = senderUsername;
    }

    public FriendEntity() {
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getFriendId() {
        return friendId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
    public String getSenderUsername() {
        return senderUsername;
    }

    public void setSenderUsername(String senderUsername) {
        this.senderUsername = senderUsername;
}}