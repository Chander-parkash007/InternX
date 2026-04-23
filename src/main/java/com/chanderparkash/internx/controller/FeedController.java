package com.chanderparkash.internx.controller;

import com.chanderparkash.internx.DTO.CommentRequest;
import com.chanderparkash.internx.DTO.CommentResponse;
import com.chanderparkash.internx.DTO.PostResponse;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.UserRepository;
import com.chanderparkash.internx.service.FeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FeedController {

    private final FeedService feedService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/feed")
    public ResponseEntity<List<PostResponse>> getFeed() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(feedService.getFeedPosts(currentUser.getId()));
    }

    @GetMapping("/feed/all")
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(feedService.getAllPosts(currentUser.getId()));
    }

    @GetMapping("/feed/all/paged")
    public ResponseEntity<Map<String, Object>> getAllPostsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User currentUser = getCurrentUser();
        List<PostResponse> all = feedService.getAllPosts(currentUser.getId());
        int total = all.size();
        int from = page * size;
        int to = Math.min(from + size, total);
        List<PostResponse> content = from >= total ? List.of() : all.subList(from, to);
        return ResponseEntity.ok(Map.of(
            "content", content,
            "totalElements", total,
            "totalPages", (int) Math.ceil((double) total / size),
            "page", page,
            "hasMore", to < total
        ));
    }

    @GetMapping("/feed/paged")
    public ResponseEntity<Map<String, Object>> getFeedPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User currentUser = getCurrentUser();
        List<PostResponse> all = feedService.getFeedPosts(currentUser.getId());
        int total = all.size();
        int from = page * size;
        int to = Math.min(from + size, total);
        List<PostResponse> content = from >= total ? List.of() : all.subList(from, to);
        return ResponseEntity.ok(Map.of(
            "content", content,
            "totalElements", total,
            "totalPages", (int) Math.ceil((double) total / size),
            "page", page,
            "hasMore", to < total
        ));
    }

    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<String> likePost(@PathVariable Long postId) {
        User currentUser = getCurrentUser();
        feedService.likePost(currentUser.getId(), postId);
        return ResponseEntity.ok("Post liked");
    }

    @DeleteMapping("/posts/{postId}/like")
    public ResponseEntity<String> unlikePost(@PathVariable Long postId) {
        User currentUser = getCurrentUser();
        feedService.unlikePost(currentUser.getId(), postId);
        return ResponseEntity.ok("Post unliked");
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long postId,
            @RequestBody CommentRequest request) {
        User currentUser = getCurrentUser();
        CommentResponse comment = feedService.addComment(
                currentUser.getId(), 
                postId, 
                request.getContent()
        );
        return ResponseEntity.ok(comment);
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(feedService.getComments(postId));
    }
}
