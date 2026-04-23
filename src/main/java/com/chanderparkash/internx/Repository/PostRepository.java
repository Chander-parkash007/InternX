package com.chanderparkash.internx.Repository;

import com.chanderparkash.internx.Entities.Post;
import com.chanderparkash.internx.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUserOrderByCreatedAtDesc(User user);
    List<Post> findAllByOrderByCreatedAtDesc();
    List<Post> findByUserIdInOrderByCreatedAtDesc(List<Long> userIds);
}
