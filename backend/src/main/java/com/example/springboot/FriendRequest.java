package com.example.springboot;

public class FriendRequest {
    private String userId;
    private String friendId;

    public FriendRequest() {
    }

    public FriendRequest(String userId, String friendId) {
        this.userId = userId;
        this.friendId = friendId;
    }

    public String getUserId() {
        return userId;
    }

    public String getFriendId() {
        return friendId;
    }
}