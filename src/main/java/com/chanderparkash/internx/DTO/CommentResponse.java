package com.chanderparkash.internx.DTO;

import com.chanderparkash.internx.Entities.PostComment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private Long id;
    private String content;
    private String authorName;
    private String authorPicture;
    private Long userId;
    private LocalDateTime createdAt;

    public static CommentResponse fromComment(PostComment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setAuthorName(comment.getUser().getName());
        response.setAuthorPicture(comment.getUser().getProfilePicture());
        response.setUserId(comment.getUser().getId());
        response.setCreatedAt(comment.getCreatedAt());
        return response;
    }
}
