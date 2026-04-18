package com.chanderparkash.internx.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chanderparkash.internx.Entities.Submission;
import com.chanderparkash.internx.Entities.Tasks;
import com.chanderparkash.internx.Entities.User;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    boolean existsByTaskAndApplicant(Tasks task, User applicant);

    List<Submission> findByApplicant(User applicant);

    List<Submission> findByTask(Tasks task);

    boolean existsByTask(Tasks task);

}
