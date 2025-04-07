package com.example.springboot;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface FriendRepository extends JpaRepository<FriendEntity, FriendKey> {

    @Query("select f from FriendEntity f where f.userId = :userId and f.status = :status")
    List<FriendEntity> findByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") String status);

    @Query("select f from FriendEntity f where f.friendId = :friendId and f.status = :status")
    List<FriendEntity> findByFriendIdAndStatus(@Param("friendId") UUID friendId, @Param("status") String status);
}