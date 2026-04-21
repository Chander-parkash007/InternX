package com.chanderparkash.internx.Repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.chanderparkash.internx.Entities.Rating;
import com.chanderparkash.internx.Entities.Tasks;
import com.chanderparkash.internx.Entities.User;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    List<Rating> findByToUser(User touser);

    List<Rating> findByFromUser(User fromuser);

    boolean existsByTaskAndToUser(Tasks task, User toUser);

    @Query("SELECT r.toUser, AVG(r.rating) as avgRating, COUNT(r) as TotalRatings " + "From Rating r GROUP BY r.toUser ORDER BY avgRating DESC")
    List<Object[]> findTopRatedStudents(Pageable pageable);

    List<Rating> findByTask(Tasks task);

}
