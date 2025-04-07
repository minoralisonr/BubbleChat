package com.example.springboot;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByEmail(String email);
    Optional<UserEntity> findByEmailAndPassword(String email, String password);

    @Query("SELECT u FROM UserEntity u WHERE u.username LIKE %:query% OR u.email LIKE %:query%")
    List<UserEntity> findByUsernameOrEmail(@Param("query") String query);
}