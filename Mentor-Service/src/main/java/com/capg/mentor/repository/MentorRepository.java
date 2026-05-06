package com.capg.mentor.repository;

import com.capg.mentor.entity.Mentor;
import com.capg.mentor.enums.MentorStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MentorRepository extends JpaRepository<Mentor, Long> {

    long countByUserId(Long userId);
    java.util.Optional<Mentor> findByUserId(Long userId);
    List<Mentor> findByStatus(MentorStatus status);

}
