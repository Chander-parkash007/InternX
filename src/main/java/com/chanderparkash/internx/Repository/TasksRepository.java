package com.chanderparkash.internx.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.chanderparkash.internx.Entities.TaskStatus;
import com.chanderparkash.internx.Entities.Tasks;
import com.chanderparkash.internx.Entities.User;

public interface TasksRepository extends JpaRepository<Tasks, Long>, JpaSpecificationExecutor<Tasks> {

    List<Tasks> findByPostedBy(User postedBy);

    List<Tasks> findByStatus(TaskStatus status);

}
