package com.chanderparkash.internx.service;

import com.chanderparkash.internx.DTO.CommentResponse;
import com.chanderparkash.internx.DTO.PostResponse;
import com.chanderparkash.internx.Entities.Post;
import com.chanderparkash.internx.Entities.PostComment;
import com.chanderparkash.internx.Entities.PostLike;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedService {
    
    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostCommentRepository postCommentRepository;
    private final ConnectionRepository connectionRepository;
    private final UserRepository userRepository;
    private final NotificationsService notificationsService;

    public List<PostResponse> getFeedPosts(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get connected user IDs
        List<Long> connectedUserIds = connectionRepository.findConnectedUserIds(user);
        connectedUserIds.add(userId); // Include own posts

        // Get posts from connected users
        List<Post> posts = postRepository.findByUserIdInOrderByCreatedAtDesc(connectedUserIds);
        
        return posts.stream()
                .map(post -> mapToPostResponse(post, user))
                .collect(Collectors.toList());
    }

    public List<PostResponse> getAllPosts(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        
        return posts.stream()
                .map(post -> mapToPostResponse(post, user))
                .collect(Collectors.toList());
    }

    private PostResponse mapToPostResponse(Post post, User currentUser) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setUserId(post.getUser().getId());
        response.setAuthorName(post.getUser().getName());
        response.setAuthorHeadline(post.getUser().getHeadline());
        response.setAuthorPicture(post.getUser().getProfilePicture());
        response.setContent(post.getContent());
        response.setImageUrl(post.getImageUrl());
        response.setCreatedAt(post.getCreatedAt().toString());
        
        // Add like and comment counts
        response.setLikeCount(postLikeRepository.countByPost(post));
        response.setCommentCount(postCommentRepository.countByPost(post));
        response.setLikedByCurrentUser(postLikeRepository.existsByPostAndUser(post, currentUser));
        
        return response;
    }

    @Transactional
    public void likePost(Long userId, Long postId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Check if already liked
        if (postLikeRepository.existsByPostAndUser(post, user)) {
            throw new RuntimeException("Post already liked");
        }

        PostLike like = new PostLike();
        like.setPost(post);
        like.setUser(user);
        postLikeRepository.save(like);
        // Notify post owner (not self)
        if (!post.getUser().getId().equals(userId)) {
            notificationsService.createNotification(post.getUser(),
                    user.getName() + " liked your post.");
        }
    }

    @Transactional
    public void unlikePost(Long userId, Long postId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        postLikeRepository.deleteByPostAndUser(post, user);
    }

    @Transactional
    public CommentResponse addComment(Long userId, Long postId, String content) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        PostComment comment = new PostComment();
        comment.setPost(post);
        comment.setUser(user);
        comment.setContent(content);
        
        PostComment savedComment = postCommentRepository.save(comment);
        // Notify post owner (not self)
        if (!post.getUser().getId().equals(userId)) {
            notificationsService.createNotification(post.getUser(),
                    user.getName() + " commented on your post: \"" + content + "\"");
        }
        return CommentResponse.fromComment(savedComment);
    }

    public List<CommentResponse> getComments(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        List<PostComment> comments = postCommentRepository.findByPostOrderByCreatedAtAsc(post);
        return comments.stream()
                .map(CommentResponse::fromComment)
                .collect(Collectors.toList());
    }
}
