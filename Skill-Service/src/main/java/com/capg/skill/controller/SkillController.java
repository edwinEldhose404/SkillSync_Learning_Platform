package com.capg.skill.controller;

import com.capg.skill.dto.request.SkillRequest;
import com.capg.skill.dto.response.SkillResponse;
import com.capg.skill.service.SkillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Skill Controller
 * Handles skill management endpoints for the Skill-Service module.
 *
 * Supports creating new skills and retrieving public skill listings or individual skill details.
 *
 * Feign: not used directly by this controller; service-layer operations handle any business logic.
 */
@RestController
@RequestMapping("/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    /**
     * Create a new skill record.
     *
     * Accepts a SkillRequest DTO and returns the created SkillResponse.
     */
    @PostMapping
    public SkillResponse createSkill(
            @Valid @RequestBody SkillRequest request) {

        return skillService.createSkill(request);
    }

    /**
     * Retrieve all public skills.
     *
     * Returns a list of available skill responses for public consumption.
     */
    @GetMapping("/public")
    public List<SkillResponse> getAllSkills() {

        return skillService.getAllSkills();
    }

    /**
     * Retrieve a single skill by ID.
     *
     * Returns detailed skill information for the requested skill identifier.
     */
    @GetMapping("/public/{id}")
    public SkillResponse getSkillById(@PathVariable Long id) {

        return skillService.getSkillById(id);
    }
}