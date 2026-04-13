package com.chanderparkash.internx.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import com.chanderparkash.internx.Entities.Skill;

public interface SkillsRepository extends JpaRepository<Skill, Long> {

    Optional<Skill> findBySkillName(String skillname);
}
