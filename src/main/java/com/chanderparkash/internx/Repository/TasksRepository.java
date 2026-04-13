package com.chanderparkash.internx.Repository;

import com.chanderparkash.internx.Entities.Tasks;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Entities.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TasksRepository extends JpaRepository<Tasks, Long> {

    List<Tasks> findByPostedBy(User postedBy);

    List<Tasks> findByStatus(TaskStatus status);

}
