package com.chanderparkash.internx.Specification;

import org.springframework.data.jpa.domain.Specification;

import com.chanderparkash.internx.Entities.TaskStatus;
import com.chanderparkash.internx.Entities.Tasks;

public class TaskSpecification {

    public static Specification<Tasks> hasDifficulty(String difficulty) {
        return (root, query, cb) -> {
            return difficulty == null ? null : cb.equal(root.get("difficulty"), difficulty);
        };
    }

    public static Specification<Tasks> hasType(String type) {
        return (root, query, cb) -> {
            return type == null ? null : cb.equal(root.get("type"), type);
        };
    }

    public static Specification<Tasks> hasStatus(String status) {
        return (root, query, cb) -> {
            return status == null ? null : cb.equal(root.get("status"), TaskStatus.valueOf(status));
        };
    }

    public static Specification<Tasks> hasKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null) {
                return null;
            }
            String pattern = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern)
            );
        };
    }

}
