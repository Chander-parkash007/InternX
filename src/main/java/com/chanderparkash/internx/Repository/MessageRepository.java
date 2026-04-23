package com.chanderparkash.internx.Repository;

import com.chanderparkash.internx.Entities.Message;
import com.chanderparkash.internx.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    // Get messages between two users
    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender = :user1 AND m.receiver = :user2) OR " +
           "(m.sender = :user2 AND m.receiver = :user1) " +
           "ORDER BY m.createdAt ASC")
    List<Message> findMessagesBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);
    
    // Get last message with each user
    @Query("SELECT m FROM Message m WHERE m.id IN (" +
           "SELECT MAX(m2.id) FROM Message m2 WHERE " +
           "(m2.sender = :user OR m2.receiver = :user) " +
           "GROUP BY CASE WHEN m2.sender = :user THEN m2.receiver.id ELSE m2.sender.id END" +
           ") ORDER BY m.createdAt DESC")
    List<Message> findLastMessagesForUser(@Param("user") User user);
    
    // Count unread messages from a specific user
    @Query("SELECT COUNT(m) FROM Message m WHERE m.sender = :sender AND m.receiver = :receiver AND m.isRead = false")
    long countUnreadMessages(@Param("sender") User sender, @Param("receiver") User receiver);
    
    // Mark messages as read
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.sender = :sender AND m.receiver = :receiver AND m.isRead = false")
    void markMessagesAsRead(@Param("sender") User sender, @Param("receiver") User receiver);
    
    // Get unread message count for user
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver = :user AND m.isRead = false")
    long countUnreadMessagesForUser(@Param("user") User user);
}
