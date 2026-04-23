package com.chanderparkash.internx.Repository;

import com.chanderparkash.internx.Entities.Post;
import com.chanderparkash.internx.Entities.PostLike;
import com.chanderparkash.internx.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    
    // Find like by post and user
    Optional<PostLike> findByPostAndUser(Post post, User user);
    
    // Check if user liked post
    boolean existsByPostAndUser(Post post, User user);
    
    // Count likes for a post
    @Query("SELECT COUNT(pl) FROM PostLike pl WHERE pl.post = :post")
    long countByPost(@Param("post") Post post);
    
    // Delete like
    void deleteByPostAndUser(Post post, User user);
}
