package com.example.springboot;

import jakarta.transaction.Transactional;
import org.apache.catalina.User;
import org.aspectj.bridge.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;
import java.util.*;

@Service
public class WebAppService {
    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private FriendRepository friendRepository;

    @Autowired
    private UserRepository userRepository;

    public MessageRequest addChat(MessageRequest messageRequest) {
        MessageEntity messageEntity = new MessageEntity();
        messageEntity.setMessage(messageRequest.getText());
        messageEntity.setSender(messageRequest.getUser());
        messageEntity.setRecipient(messageRequest.getRecipient());
        messageEntity.setSentAt(messageRequest.getTimestamp().toInstant());
        messageEntity = messageRepository.save(messageEntity);
        return new MessageRequest(messageEntity.getId(), messageEntity.getSender(), messageEntity.getRecipient(), messageEntity.getMessage(), Date.from(messageEntity.getSentAt()));
    }

    public List<MessageRequest> getChats(FriendRequest friend) {
        List<MessageRequest> sentMessages = messageRepository
                .findBySenderAndRecipient(friend.getUserId(), friend.getFriendId())
                .stream()
                .map(message -> {
                        Optional<UserEntity> user = userRepository.findById(UUID.fromString(message.getSender()));
                        String email = "<Unknown>";
                        if (user.isPresent()) {
                            email = user.get().getEmail();
                        }
                        return new MessageRequest(message.getId(), email, message.getRecipient(), message.getMessage(), Date.from(message.getSentAt()));
                })
                .toList();
        List<MessageRequest> recievedMessages = messageRepository
                .findBySenderAndRecipient(friend.getFriendId(), friend.getUserId())
                .stream()
                .map(message -> {
                        Optional<UserEntity> user = userRepository.findById(UUID.fromString(message.getSender()));
                        String email = "<Unknown>";
                        if (user.isPresent()) {
                            email = user.get().getEmail();
                        }
                        return new MessageRequest(message.getId(), email, message.getRecipient(), message.getMessage(), Date.from(message.getSentAt()));
                })
                .toList();
        List<MessageRequest> allMessages = new ArrayList<>(sentMessages);
        allMessages.addAll(recievedMessages);
        allMessages.sort(Comparator.comparing(MessageRequest::getTimestamp));
        return allMessages;
    }

    public UserRequest register(UserRequest userRequest) {
        if (userRepository.findByEmail(userRequest.getEmail()).isEmpty()) {
            UserEntity createdUser = new UserEntity();
            createdUser.setEmail(userRequest.getEmail());
            createdUser.setPassword(userRequest.getPassword());
            createdUser.setUsername(userRequest.getUsername());
            userRepository.save(createdUser);
            userRequest.setId(createdUser.getUserId().toString());
            return userRequest;
        }
        return null;
    }

    public UserRequest login(UserRequest userRequest) {
        Optional<UserEntity> optionalUser = userRepository.findByEmailAndPassword(userRequest.getEmail(), userRequest.getPassword());
        if (optionalUser.isPresent()) {
            UserEntity user = optionalUser.get();
            userRequest.setId(user.getUserId().toString());
            userRequest.setUsername(user.getUsername());
            return userRequest;
        }
        return null;
    }

    public FriendRequest addFriend(FriendRequest friend) {
        Optional<UserEntity> currentUser = userRepository.findById(UUID.fromString(friend.getUserId()));
        Optional<UserEntity> friendUser = userRepository.findByEmail(friend.getFriendId());
        if (currentUser.isPresent() && friendUser.isPresent()) {
            // Fixed constructor calls to include all required parameters
            String status = "pending";  // Default status
            String senderUsername = currentUser.get().getUsername();
            FriendEntity entity = new FriendEntity(currentUser.get().getUserId(), friendUser.get().getUserId(), status, senderUsername);
            entity = friendRepository.save(entity);
            
            FriendEntity entity2 = new FriendEntity(friendUser.get().getUserId(), currentUser.get().getUserId(), status, senderUsername);
            friendRepository.save(entity2);
            return new FriendRequest(entity.getUserId().toString(), entity.getFriendId().toString());
        }
        return null;
    }

    public List<FriendRequest> getFriends(String currentUser) {
        List<FriendEntity> friendEntities = friendRepository.findAll();
        if (friendEntities.isEmpty()) {
            return List.of();
        }
        return friendEntities.stream()
                .map(friendEntity -> {
                    String email = "";
                    Optional<UserEntity> user = userRepository.findById(friendEntity.getFriendId());
                    if (user.isPresent())
                        email = user.get().getEmail();
                    return new FriendRequest(
                            friendEntity.getUserId().toString(),
                            friendEntity.getFriendId().toString());
                })
                .toList();
    }

//    public void deleteFriend(String friendId) {
//    }
}