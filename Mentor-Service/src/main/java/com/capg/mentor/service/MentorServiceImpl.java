package com.capg.mentor.service;

import com.capg.mentor.client.SkillClient;
import com.capg.mentor.client.AuthClient;
import com.capg.mentor.client.UserClient;
import com.capg.mentor.dto.SkillDto;
import com.capg.mentor.dto.UserDto;
import com.capg.mentor.dto.request.AvailabilityRequest;
import com.capg.mentor.dto.request.MentorRequest;
import com.capg.mentor.dto.response.ApprovedMentorResponse;
import com.capg.mentor.dto.response.MentorResponse;
import com.capg.mentor.entity.Availability;
import com.capg.mentor.entity.Mentor;
import com.capg.mentor.entity.MentorSkill;
import com.capg.mentor.enums.MentorStatus;
import com.capg.mentor.exception.BadRequestException;
import com.capg.mentor.exception.ResourceNotFoundException;
import com.capg.mentor.mapper.MentorMapper;
import com.capg.mentor.repository.AvailabilityRepository;
import com.capg.mentor.repository.MentorRepository;
import com.capg.mentor.repository.MentorSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Mentor Service Implementation
 * Handles business logic for mentor-related operations
 * 
 * Exception Handling:
 * - ResourceNotFoundException: Thrown when mentor, user, or skill is not found (HTTP 404)
 * - BadRequestException: Thrown when user has already applied or availability times are invalid (HTTP 400)
 */
@Service
@RequiredArgsConstructor
public class MentorServiceImpl implements MentorService {

    private final MentorRepository mentorRepository;
    private final MentorSkillRepository mentorSkillRepository;
    private final AvailabilityRepository availabilityRepository;

    private final UserClient userClient;
    private final SkillClient skillClient;
    private final AuthClient authClient;

    private static final String message1 = "Mentor not found";
    /**
     * Apply for a mentorship role
     * 
     * @param request Mentor application request
     * @return MentorResponse containing mentor details
     * @throws BadRequestException if user already applied
     * @throws ResourceNotFoundException if user or skills do not exist
     */
    @Override
    @Transactional
    public MentorResponse applyForMentor(MentorRequest request) {
        try {
            // 0. Validate if user has already applied
            if (mentorRepository.countByUserId(request.getUserId()) > 0) {
                throw new BadRequestException("User has already applied for mentor");
            }

            // 1. Validate user exists and check role
            UserDto user = null;
            try {
                user = userClient.getUserById(request.getUserId());
                if (user != null) {
                    String currentRole = user.getRole().toUpperCase();
                    if ("MENTOR".equals(currentRole) || "ADMIN".equals(currentRole)) {
                        throw new BadRequestException("You are already a " + currentRole + ". You cannot apply to be a mentor.");
                    }
                }
            } catch (BadRequestException e) {
                throw e; // Rethrow our role check error
            } catch (Exception e) {
                // For legacy users or if user-service is down, we check if we can continue
                System.err.println("[SkillSync] Could not verify role for application: " + e.getMessage());
            }

            if (user == null) {
                throw new ResourceNotFoundException("User not found");
            }


            // 2. Validate skills exist
            for (Long skillId : request.getSkillIds()) {
                try {
                    SkillDto skill = skillClient.getSkillById(skillId);
                    if (skill == null) {
                        throw new ResourceNotFoundException("Skill not found: " + skillId);
                    }
                } catch (Exception e) {
                    // If skill-service returns 404 or fails, we'll throw a clear error
                    throw new ResourceNotFoundException("Skill ID " + skillId + " does not exist in the Skill Catalog. Please use valid Skill IDs.");
                }
            }

            // 3. Convert DTO → Entity
            Mentor mentor = MentorMapper.toEntity(request);
            
            // 4. Save mentor
            Mentor savedMentor = mentorRepository.save(mentor);

            // 5. Save mentor skills
            List<MentorSkill> mentorSkills =
                    MentorMapper.toMentorSkills(savedMentor.getMentorId(), request.getSkillIds());

            mentorSkillRepository.saveAll(mentorSkills);

            // 6. Prepare response
            List<Long> skillIds = mentorSkills.stream()
                    .map(MentorSkill::getSkillId)
                    .toList();

            return MentorMapper.toResponse(savedMentor, skillIds, skillClient);
        } catch (BadRequestException | ResourceNotFoundException e) {
            throw e;
        } catch (Throwable t) {
            t.printStackTrace();
            throw new RuntimeException("DIAGNOSTIC ERROR [" + t.getClass().getSimpleName() + "]: " + t.getMessage());
        }
    }

    @Override
    public List<MentorResponse> getMentorsByStatus(String status) {
        MentorStatus mentorStatus = MentorStatus.valueOf(status.toUpperCase());
        return mentorRepository.findByStatus(mentorStatus).stream()
                .map(mentor -> {
                    List<Long> skillIds = mentorSkillRepository.findByMentorId(mentor.getMentorId()).stream()
                            .map(MentorSkill::getSkillId)
                            .toList();
                    return MentorMapper.toResponse(mentor, skillIds, skillClient);
                })
                .toList();
    }

    /**
     * Retrieve all approved mentors
     * 
     * @return List of MentorResponse objects
     */
    @Override
    public List<MentorResponse> getAllMentors() {

        List<Mentor> mentors = mentorRepository.findAll();

        return mentors.stream().map(mentor -> {

            List<Long> skillIds = mentorSkillRepository.findByMentorId(mentor.getMentorId())
                    .stream()
                    .map(MentorSkill::getSkillId)
                    .toList();

            return MentorMapper.toResponse(mentor, skillIds, skillClient);

        }).toList();
    }

    /**
     * Retrieve a specific mentor by ID
     * 
     * @param id Mentor ID
     * @return MentorResponse containing mentor details
     * @throws ResourceNotFoundException if mentor is not found
     */
    @Override
    public MentorResponse getMentorById(Long id) {

        Mentor mentor = mentorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(message1));

        List<Long> skillIds = mentorSkillRepository.findByMentorId(id)
                .stream()
                .map(MentorSkill::getSkillId)
                .toList();

        return MentorMapper.toResponse(mentor, skillIds, skillClient);

    }

    /**
     * Add availability slot for a mentor
     * 
     * @param request Availability limits and details
     * @throws ResourceNotFoundException if mentor is not found
     * @throws BadRequestException if start time is after end time
     */
    @Override
    public void addAvailability(AvailabilityRequest request) {

        Mentor mentor = mentorRepository.findById(request.getMentorId())
                .orElseThrow(() -> new ResourceNotFoundException(message1));

        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }

        Availability availability = Availability.builder()
                .mentorId(mentor.getMentorId())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();

        availabilityRepository.save(availability);
    }

    /**
     * Approve a mentor application (Admin only)
     * 
     * @param mentorId Mentor ID
     * @return ApprovedMentorResponse indicating success
     * @throws ResourceNotFoundException if mentor is not found
     */
    @Override
    @Transactional
    public ApprovedMentorResponse approveMentor(Long mentorId) {
        Mentor mentor = mentorRepository.findById(mentorId).orElseThrow(() -> new ResourceNotFoundException("Mentor application not found"));
        Long userId = mentor.getUserId();
        
        // --- Mega Sync Logic (Fixes ID Mismatch) ---
        try {
            // 1. Get Email from Auth Service by ID (Reliable)
            java.util.Map<String, Object> authUser = authClient.getUserById(userId);
            String email = (String) authUser.get("email");

            if (email != null) {
                // 2. Sync Auth Role (via Email)
                authClient.updateRole(email, "MENTOR");

                // 3. Sync User Role (via correct Profile ID found by Email)
                UserDto profile = userClient.getUserByEmail(email);
                if (profile != null) {
                    userClient.updateUserRole(profile.getId(), "MENTOR");
                    System.out.println("[SkillSync] Successfully synced MENTOR role for: " + email);
                }
            }
        } catch (Exception e) {
            System.err.println("[SkillSync] Mega Sync failed for User ID " + userId + ": " + e.getMessage());
            // We still proceed to update the mentor status so the admin panel is accurate
        }

        // 2. Update Mentor Status (Admin UI state)
        mentor.setStatus(MentorStatus.APPROVED);
        Mentor saved = mentorRepository.save(mentor);
        
        return MentorMapper.toApprovedResponse(saved);
    }

    /**
     * Deny a mentor application (Admin only)
     * 
     * @param mentorId Mentor ID
     * @throws ResourceNotFoundException if mentor is not found
     */

    public void denyMentor(Long mentorId) {
        Mentor mentor = mentorRepository.findById(mentorId).orElseThrow(() -> new ResourceNotFoundException(message1));
        mentor.setStatus(MentorStatus.REJECTED);
        mentorRepository.save(mentor);
    }

    /**
     * Update the rating of a mentor
     * 
     * @param mentorId Mentor ID
     * @param rating New rating value
     * @throws ResourceNotFoundException if mentor is not found
     */
    @Override
    public void updateRating(Long mentorId, Double rating) {
        Mentor mentor = mentorRepository.findById(mentorId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        mentor.setRating(rating);
        mentorRepository.save(mentor);
    }

    @Override
    public MentorResponse getMentorByUserId(Long userId) {
        Mentor mentor = mentorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor not found for user ID: " + userId));

        List<Long> skillIds = mentorSkillRepository.findByMentorId(mentor.getMentorId())
                .stream()
                .map(MentorSkill::getSkillId)
                .toList();

        return MentorMapper.toResponse(mentor, skillIds, skillClient);
    }


}