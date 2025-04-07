package com.example.springboot;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/friends")
public class FriendController {
    
    @Autowired
    private WebAppService webAppService;
    
    @PostMapping("/add")
    public ResponseEntity<FriendRequest> addFriend(@RequestBody FriendRequest friendRequest) {
        FriendRequest savedFriend = webAppService.addFriend(friendRequest);
        if (savedFriend != null) {
            return ResponseEntity.ok(savedFriend);
        }
        return ResponseEntity.badRequest().build();
    }
    
    @GetMapping("/list")
    public ResponseEntity<List<FriendRequest>> getFriends(@RequestParam("userId") String userId) {
        List<FriendRequest> friends = webAppService.getFriends(userId);
        if (friends == null) {
            return ResponseEntity.internalServerError().build();
        }
        
        if (friends.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(friends);
    }
    
    @PutMapping("/status")
    public ResponseEntity<FriendRequest> updateFriendStatus(
            @RequestParam("userId") String userId,
            @RequestParam("friendId") String friendId,
            @RequestParam("status") String status) {
        // You would need to implement this method in your WebAppService
        // FriendRequest updatedFriend = webAppService.updateFriendStatus(userId, friendId, status);
        // return ResponseEntity.ok(updatedFriend);
        
        // For now, returning not implemented
        return ResponseEntity.status(501).build(); // 501 Not Implemented
    }
    
    @DeleteMapping("/{userId}/{friendId}")
    public ResponseEntity<Void> deleteFriend(
            @PathVariable("userId") String userId,
            @PathVariable("friendId") String friendId) {
        // You would need to implement this method in your WebAppService
        // boolean deleted = webAppService.deleteFriend(userId, friendId);
        // if (deleted) {
        //     return ResponseEntity.ok().build();
        // }
        // return ResponseEntity.notFound().build();
        
        // For now, returning not implemented
        return ResponseEntity.status(501).build(); // 501 Not Implemented
    }
}