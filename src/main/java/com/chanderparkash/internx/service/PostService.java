package com.chanderparkash.internx.service;

import com.chanderparkash.internx.DTO.PostResponse;
import com.chanderparkash.internx.Entities.Post;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.PostCommentRepository;
import com.chanderparkash.internx.Repository.PostLikeRepository;
import com.chanderparkash.internx.Repository.PostRepository;
import com.chanderparkash.internx.Repository.UserRepository;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostCommentRepository postCommentRepository;
    private final Cloudinary cloudinary;

    public PostResponse createPost(String content, MultipartFile image) throws IOException {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        Post post = new Post();
        post.setUser(user);
        post.setContent(content);

        if (image != null && !image.isEmpty()) {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(
                    image.getBytes(),
                    ObjectUtils.asMap("folder", "internx/posts", "resource_type", "image")
            );
            post.setImageUrl((String) result.get("secure_url"));
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
        r.setLikeCount(postLikeRepository.countByPost(p));
        r.setCommentCount(postCommentRepository.countByPost(p));
        r.setLikedByCurrentUser(postLikeRepository.existsByPostAndUser(p, currentUser));
        return r;
    }
}
