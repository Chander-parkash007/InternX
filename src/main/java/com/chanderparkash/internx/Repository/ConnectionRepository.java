package com.chanderparkash.internx.Repository;

import com.chanderparkash.internx.Entities.Connection;
import com.chanderparkash.internx.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConnectionRepository extends JpaRepository<Connection, Long> {
    
    // Find connection between two users
    @Query("SELECT c FROM Connection c WHERE " +
           "(c.requester = :user1 AND c.receiver = :user2) OR " +
           "(c.requester = :user2 AND c.receiver = :user1)")
    Optional<Connection> findConnectionBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);
    
    // Get all followers (people who follow me)
    @Query("SELECT c FROM Connection c WHERE c.receiver = :user AND c.status = 'ACCEPTED'")
    List<Connection> findFollowers(@Param("user") User user);
    
    // Get all following (people I follow)
    @Query("SELECT c FROM Connection c WHERE c.requester = :user AND c.status = 'ACCEPTED'")
    List<Connection> findFollowing(@Param("user") User user);
    
    // Get pending requests received
    @Query("SELECT c FROM Connection c WHERE c.receiver = :user AND c.status = 'PENDING'")
    List<Connection> findPendingRequests(@Param("user") User user);
    
    // Count followers
    @Query("SELECT COUNT(c) FROM Connection c WHERE c.receiver = :user AND c.status = 'ACCEPTED'")
    long countFollowers(@Param("user") User user);
    
    // Count following
    @Query("SELECT COUNT(c) FROM Connection c WHERE c.requester = :user AND c.status = 'ACCEPTED'")
    long countFollowing(@Param("user") User user);
    
    // Count pending
    @Query("SELECT COUNT(c) FROM Connection c WHERE c.receiver = :user AND c.status = 'PENDING'")
    long countPending(@Param("user") User user);
    
    // Check if users are connected
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Connection c WHERE " +
           "((c.requester = :user1 AND c.receiver = :user2) OR " +
           "(c.requester = :user2 AND c.receiver = :user1)) AND c.status = 'ACCEPTED'")
    boolean areUsersConnected(@Param("user1") User user1, @Param("user2") User user2);
    
    // Get all connected user IDs
    @Query("SELECT CASE WHEN c.requester = :user THEN c.receiver.id ELSE c.requester.id END " +
           "FROM Connection c WHERE (c.requester = :user OR c.receiver = :user) AND c.status = 'ACCEPTED'")
    List<Long> findConnectedUserIds(@Param("user") User user);
}
