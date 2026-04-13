package com.chanderparkash.internx.Repository;

import com.chanderparkash.internx.Entities.UserSkills;
import com.chanderparkash.internx.Entities.Skill;
import com.chanderparkash.internx.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserSkillsRepository extends JpaRepository<UserSkills, Long> {

    List<UserSkills> findByUser(User user);

    boolean existsByUserAndSkill(User user, Skill skill);
}
