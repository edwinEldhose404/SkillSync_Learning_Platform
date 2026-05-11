package com.capg.mentor.entity;

import com.capg.mentor.enums.MentorStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Mentor")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mentor {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "mentor_seq")
    @SequenceGenerator(name = "mentor_seq", sequenceName = "mentor_seq", allocationSize = 1)
    private Long mentorId;


    @Column(nullable = false, unique = true)
    private Long userId;


    private String bio;
    private Integer experience;
    private Double rating;
    private Double hourlyRate;

    @Enumerated(EnumType.STRING)
    private MentorStatus status;

}
