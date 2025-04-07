package com.example.springboot;

import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.time.Instant;
import java.util.List;

@RestController
public class WebAppController {
    @Autowired
    private WebAppService service;

    @PostMapping("/addMessage")
    public ResponseEntity<MessageRequest> addMessage(@RequestBody MessageRequest messageRequest) {
        MessageRequest message = service.addChat(messageRequest);
        if (message != null)
            return ResponseEntity.ok(message);
        return ResponseEntity.internalServerError().build();
    }

    @PostMapping("/getMessages")
    public ResponseEntity<List<MessageRequest>> getMessages(@RequestBody FriendRequest friend) {
        List<MessageRequest> messageEntity = service.getChats(friend);
        if (messageEntity.isEmpty())
            return ResponseEntity.noContent().build();
        return ResponseEntity.ok(messageEntity);
    }

	@PostMapping("/addFriend")
    public ResponseEntity<FriendRequest> addfriend(@RequestBody FriendRequest friend) {
        FriendRequest savedFriend = service.addFriend(friend);
        if (savedFriend != null)
		    return ResponseEntity.ok(savedFriend);
        return ResponseEntity.internalServerError().build();
	}

    @GetMapping("/getFriends")
    public ResponseEntity<List<FriendRequest>> getFriends(@RequestParam("userId") String currentUser) {
        List<FriendRequest> friends = service.getFriends(currentUser);
        if (friends == null)
            return ResponseEntity.internalServerError().build();

        if (friends.isEmpty())
            return ResponseEntity.noContent().build();

        return ResponseEntity.ok(friends);
    }

//    @DeleteMapping("/{id}")
//    public ResponseEntity<FriendRequest> deleteFriend(@PathVariable String id) {
//        FriendRequest deletedFriend = service.deleteFriend(id);
//        if (deletedFriend != null)
//            return ResponseEntity.ok(deletedFriend);
//        return ResponseEntity.internalServerError().build();
//    }
    @PostMapping("/register")
    public ResponseEntity<UserRequest> registerUser(@RequestBody UserRequest user) {
        UserRequest userResponse = service.register(user);
        if (userResponse != null)
            return ResponseEntity.ok(userResponse);
        return ResponseEntity.internalServerError().build();
    }

    @PostMapping("/login")
    public ResponseEntity<UserRequest> login(@RequestBody UserRequest user) {
        UserRequest userResponse = service.login(user);
        if (userResponse != null)
            return ResponseEntity.ok(userResponse);
        return ResponseEntity.internalServerError().build();
    }
}
