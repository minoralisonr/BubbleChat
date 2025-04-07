package com.example.springboot;

import jakarta.persistence.Entity;
import jakarta.persistence.IdClass;

import java.io.Serializable;
import java.util.UUID;

public class FriendKey implements Serializable {
    private UUID userId;

    private UUID friendId;

    public FriendKey() {

    }
    public FriendKey(UUID userId, UUID friendId) {
        this.userId = userId;
        this.friendId = friendId;
    }

    @Override
    public boolean equals(Object o) {
        if (o.getClass() == FriendKey.class) {
           if (o == this)
               return true;
           FriendKey other = (FriendKey) o;
           return userId.equals(other.userId) && friendId.equals(other.friendId);
        }
        return false;
    }

    @Override
    public int hashCode() {
        return userId.hashCode() + 31 * friendId.hashCode();
    }
}
