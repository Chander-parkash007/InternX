package com.chanderparkash.internx.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chanderparkash.internx.Entities.Notifications;
import com.chanderparkash.internx.Entities.User;

public interface NotificationsRepository extends JpaRepository<Notifications, Long> {

    List<Notifications> findByUserOrderByCreatedAtDesc(User user);

    List<Notifications> findByUserAndIsRead(User user, boolean isRead);
}
