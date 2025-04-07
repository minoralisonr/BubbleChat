package com.example.springboot;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<MessageEntity, Long> {
    @Query("select m from MessageEntity m where m.sender = :sender and m.recipient = :recipient")
    List<MessageEntity> findBySenderAndRecipient(@Param("sender") String sender, @Param("recipient") String recipient);
}
