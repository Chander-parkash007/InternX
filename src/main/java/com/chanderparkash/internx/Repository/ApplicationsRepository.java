package com.chanderparkash.internx.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chanderparkash.internx.Entities.Applications;
import com.chanderparkash.internx.Entities.Tasks;
import com.chanderparkash.internx.Entities.User;

public interface ApplicationsRepository extends JpaRepository<Applications, Long> {

    List<Applications> findByUser(User user);

    List<Applications> findByTask(Tasks task);

    Optional<Applications> findByTaskAndUser(Tasks task, User student);

    boolean existsByTaskAndUser(Tasks task, User student);

    boolean existsByTaskAndUserAndStatus(Tasks task, User student, com.chanderparkash.internx.Entities.ApplicationStatus status);

}
