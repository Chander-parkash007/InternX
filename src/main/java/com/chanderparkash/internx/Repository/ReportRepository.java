package com.chanderparkash.internx.Repository;

import com.chanderparkash.internx.Entities.Report;
import com.chanderparkash.internx.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findAllByOrderByCreatedAtDesc();
    List<Report> findByStatusOrderByCreatedAtDesc(Report.ReportStatus status);
    List<Report> findByReporterOrderByCreatedAtDesc(User reporter);
    long countByStatus(Report.ReportStatus status);
}
