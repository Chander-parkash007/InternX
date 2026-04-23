package com.chanderparkash.internx.DTO;

import lombok.Data;

@Data
public class PostResponse {
    private Long id;
    private Long userId;
    private String authorName;
    private String authorHeadline;
    private String authorPicture;
    private String content;
    private String imageUrl;
    private String createdAt;
    private long likeCount;
    private long commentCount;
    private boolean isLikedByCurrentUser;
}
