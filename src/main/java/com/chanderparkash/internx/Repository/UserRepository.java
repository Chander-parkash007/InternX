package com.chanderparkash.internx.Repository;

import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Entities.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    
    // Search users by name or email
    @Query("SELECT u FROM User u WHERE LOWER(u.name) LIKE %:query% OR LOWER(u.email) LIKE %:query%")
    List<User> searchUsers(@Param("query") String query);
    
    // Find users by role excluding specific user
    List<User> findByRoleAndIdNot(Role role, Long excludeId);
}
