package com.chanderparkash.internx.service;

import com.chanderparkash.internx.DTO.PostResponse;
import com.chanderparkash.internx.Entities.Post;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.PostCommentRepository;
import com.chanderparkash.internx.Repository.PostLikeRepository;
import com.chanderparkash.internx.Repository.PostRepository;
import com.chanderparkash.internx.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostCommentRepository postCommentRepository;

    private static final String UPLOAD_DIR = "uploads/";

    public PostResponse createPost(String content, MultipartFile image) throws IOException {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        Post post = new Post();
        post.setUser(user);
        post.setContent(content);

        if (image != null && !image.isEmpty()) {
            String filename = UUID.randomUUID() + "_" + image.getOriginalFilename();
            Path uploadPath = Paths.get(UPLOAD_DIR);
            Files.createDirectories(uploadPath);
            Files.copy(image.getInputStream(), uploadPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            post.setImageUrl("/uploads/" + filename);
        }

        return toResponse(postRepository.save(post), user);
    }

    public List<PostResponse> getFeed() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElseThrow();
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(p -> toResponse(p, currentUser))
                .toList();
    }

    public List<PostResponse> getUserPosts(Long userId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();
        return postRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(p -> toResponse(p, currentUser))
                .toList();
    }

    public void deletePost(Long postId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        Post post = postRepository.findById(postId).orElseThrow();
        if (!post.getUser().getId().equals(user.getId())) throw new RuntimeException("Not authorized");
        postRepository.delete(post);
    }

    private PostResponse toResponse(Post p, User currentUser) {
        PostResponse r = new PostResponse();
        r.setId(p.getId());
        r.setUserId(p.getUser().getId());
        r.setAuthorName(p.getUser().getName());
        r.setAuthorHeadline(p.getUser().getHeadline());
        r.setAuthorPicture(p.getUser().getProfilePicture());
        r.setContent(p.getContent());
        r.setImageUrl(p.getImageUrl());
        r.setCreatedAt(p.getCreatedAt().toString());
        
        // Add like and comment counts
        r.setLikeCount(postLikeRepository.countByPost(p));
        r.setCommentCount(postCommentRepository.countByPost(p));
        r.setLikedByCurrentUser(postLikeRepository.existsByPostAndUser(p, currentUser));
        
        return r;
    }
}
