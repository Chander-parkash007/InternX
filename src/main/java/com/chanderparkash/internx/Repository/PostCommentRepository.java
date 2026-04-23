package com.chanderparkash.internx.Repository;

import com.chanderparkash.internx.Entities.Post;
import com.chanderparkash.internx.Entities.PostComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostCommentRepository extends JpaRepository<PostComment, Long> {
    
    // Get comments for a post
    List<PostComment> findByPostOrderByCreatedAtAsc(Post post);
    
    // Count comments for a post
    @Query("SELECT COUNT(pc) FROM PostComment pc WHERE pc.post = :post")
    long countByPost(@Param("post") Post post);
}
