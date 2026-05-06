package com.capg.mentor.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "mentor_skill_seq")
    @SequenceGenerator(name = "mentor_skill_seq", sequenceName = "mentor_skill_seq", allocationSize = 1)
    private Long id;
    @NotNull
    private Long mentorId;
    @NotNull
    private Long skillId;
}
