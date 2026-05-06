package com.capg.group.service;

import com.capg.group.dto.ApiResponse;
import com.capg.group.dto.CreateGroupRequest;
import com.capg.group.dto.GroupResponse;
import com.capg.group.dto.MemberDto;
import com.capg.group.entity.Group;
import com.capg.group.entity.GroupMember;
import com.capg.group.exception.ResourceNotFoundException;
import com.capg.group.repository.GroupMemberRepository;
import com.capg.group.repository.GroupRepository;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Group Service Implementation
 * Handles business logic for group-related operations
 * 
 * Exception Handling:
 * - ResourceNotFoundException: Thrown when group or user is not found (HTTP 404)
 * - RuntimeException: Thrown when user is already a member, not a member, or removing last admin (HTTP 400)
 */
@Service
@Transactional
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;

    public GroupServiceImpl(GroupRepository groupRepository,
            GroupMemberRepository memberRepository) {
        this.groupRepository = groupRepository;
        this.memberRepository = memberRepository;
    }

    /**
     * Create a new group
     * 
     * @param email Creator's email
     * @param request CreateGroupRequest containing group details
     * @return Group representing the created group
     */
    @Override
    public Group createGroup(String email, CreateGroupRequest request) {

        String normalizedEmail = email.toLowerCase().trim();
        Group group = new Group();
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        group.setCreatedBy(normalizedEmail);

        Group savedGroup = groupRepository.save(group);

        GroupMember member = new GroupMember();
        member.setGroupId(savedGroup.getId());
        member.setUserEmail(normalizedEmail);
        member.setRole("ADMIN");

        memberRepository.save(member);

        return savedGroup;
    }

	/**
	 * Join an existing group
	 * 
	 * @param email User's email
	 * @param groupId Group ID
	 * @throws RuntimeException if group not found or user is already a member
	 */
	@Override
	public void joinGroup(String email, Long groupId) {
        String normalizedEmail = email.toLowerCase().trim();
        
		 // 1. Check group exists
	    Group group = groupRepository.findById(groupId)
	            .orElseThrow(() -> new RuntimeException("Group not found"));

	    // 2. Check already joined (Case-Insensitive)
	    if (memberRepository.findByGroupIdAndUserEmailIgnoreCase(groupId, normalizedEmail).isPresent()) {
	        return; // Already a member, nothing to do
	    }

	    // 3. Add member
	    GroupMember member = new GroupMember();
	    member.setGroupId(groupId);
	    member.setUserEmail(normalizedEmail);
	    member.setRole("MEMBER");

	    memberRepository.save(member);
		
	}
	/**
	 * Retrieve group by ID
	 * 
	 * @param groupId Group ID
	 * @return GroupResponse for the given ID
	 * @throws ResourceNotFoundException if group is not found
	 */
	@Override
	public GroupResponse getGroup(Long groupId) {

		Group group = groupRepository.findById(groupId)
	            .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

		return mapToResponse(group);
	}

    private GroupResponse mapToResponse(Group group) {
        GroupResponse response = new GroupResponse();
        response.setId(group.getId());
        response.setName(group.getName());
        response.setDescription(group.getDescription());
        response.setCreatedBy(group.getCreatedBy());
        
        // Ensure members list is always populated
        List<MemberDto> members = memberRepository.findByGroupId(group.getId()).stream()
            .map(m -> new MemberDto(m.getUserEmail(), m.getRole()))
            .toList();
        response.setMembers(members);
        
        return response;
    }

	/**
	 * Leave a group
	 * 
	 * @param email User's email
	 * @param groupId Group ID
	 * @throws RuntimeException if user is not a member or is the only admin
	 */
	@Override
	public void leaveGroup(String email, Long groupId) {
        String normalizedEmail = email.toLowerCase().trim();
        
        List<GroupMember> allMembers = memberRepository.findByGroupId(groupId);
        System.out.println("LEAVE GROUP DEBUG: Looking for " + normalizedEmail + " in group " + groupId);
        
        GroupMember targetMember = null;
        for (GroupMember m : allMembers) {
            System.out.println("DEBUG: Member in DB: [" + m.getUserEmail() + "]");
            if (m.getUserEmail() != null && m.getUserEmail().trim().equalsIgnoreCase(normalizedEmail)) {
                targetMember = m;
                break;
            }
        }
        
        if (targetMember == null) {
            StringBuilder sb = new StringBuilder();
            sb.append("Not a member of this group: ").append(normalizedEmail).append(" | Members in DB: ");
            for (GroupMember m : allMembers) {
                sb.append("[").append(m.getUserEmail()).append("]");
            }
            throw new RuntimeException(sb.toString());
        }

        try {
            // Null-safe role check
            if ("ADMIN".equals(targetMember.getRole())) {
                long adminCount = memberRepository.countByGroupIdAndRole(groupId, "ADMIN");
                if (adminCount <= 1) {
                    throw new RuntimeException("Cannot leave as the only admin. Delete the group instead.");
                }
            }

            memberRepository.delete(targetMember);
        } catch (Exception e) {
            throw new RuntimeException("Failed during delete or admin check: " + e.getMessage() + " | Type: " + e.getClass().getName());
        }
	}

	@Override
	public void deleteGroup(String email, Long groupId, boolean isAdmin) {
        String normalizedEmail = email.toLowerCase().trim();
        
	    Group group = groupRepository.findById(groupId)
	            .orElseThrow(() -> new RuntimeException("Group not found"));

	    // Check if user is either the creator OR a global admin
	    boolean isCreator = group.getCreatedBy() != null && group.getCreatedBy().equalsIgnoreCase(normalizedEmail);
	    
	    if (!isCreator && !isAdmin) {
	        throw new RuntimeException("Only the creator or a global admin can delete this group");
	    }

	    // Remove all members first
	    List<GroupMember> members = memberRepository.findByGroupId(groupId);
	    memberRepository.deleteAll(members);

	    // Delete the group
	    groupRepository.delete(group);
	}

	/**
	 * Remove a member from a group (Admin only)
	 * 
	 * @param adminEmail Admin's email
	 * @param groupId Group ID
	 * @param targetEmail Email of the member to remove
	 * @return ApiResponse with success status
	 * @throws ResourceNotFoundException if admin or target user is not found
	 * @throws RuntimeException if target user is not in group
	 */
	@Override
	public ApiResponse<String> removeMember(String adminEmail, Long groupId, String targetEmail) {

		    // 1. Check admin
		    GroupMember admin = memberRepository
		            .findByGroupIdAndUserEmailIgnoreCase(groupId, adminEmail).orElseThrow(() -> new ResourceNotFoundException("User not found"));

		    if (!"ADMIN".equals(admin.getRole())) {
				return ApiResponse.<String>builder()
						.success(true)
						.message("Only admin can remove members")
						.data(null)
						.build();
		    }

		    // 2. Find target
		    GroupMember target = memberRepository
		            .findByGroupIdAndUserEmailIgnoreCase(groupId, targetEmail).orElseThrow(()-> new RuntimeException("User not in group"));

		    // 3. Prevent removing last admin
		    if ("ADMIN".equals(target.getRole())) {
		        long adminCount = memberRepository
		                .countByGroupIdAndRole(groupId, "ADMIN");

		        if (adminCount == 1) {
					return ApiResponse.<String>builder()
							.success(true)
							.message("Cannot remove last admin")
							.data(null)
							.build();
		        }
		    }

		    memberRepository.delete(target);
			return ApiResponse.<String>builder()
				.success(true)
				.message("Member Removed Successfully")
				.data(null)
				.build();
		}
		
	/**
	 * Retrieve groups belonging to the user
	 * 
	 * @param email User's email
	 * @return List of GroupResponse objects
	 */
	@Override
	public List<GroupResponse> getMyGroups(String email) {

	    return memberRepository.findByUserEmail(email)
	            .stream()
	            .map(member -> {

	                Group group = groupRepository.findById(member.getGroupId())
	                        .orElseThrow(() -> new RuntimeException("Group not found"));

	                GroupResponse response = new GroupResponse();
	                response.setId(group.getId());
	                response.setName(group.getName());
	                response.setDescription(group.getDescription());
	                response.setCreatedBy(group.getCreatedBy());

                  // Populate members
                  List<MemberDto> members = memberRepository.findByGroupId(group.getId()).stream()
                      .map(m -> new MemberDto(m.getUserEmail(), m.getRole()))
                      .toList();
                  response.setMembers(members);

	                return response;

	            })
	            .toList();
	}

	/**
	 * Retrieve all groups
	 * 
	 * @return List of GroupResponse objects
	 */
	@Override
	public List<GroupResponse> getAllGroups() {
	    return groupRepository.findAll()
	            .stream()
	            .map(group -> {
	                GroupResponse response = new GroupResponse();
	                response.setId(group.getId());
	                response.setName(group.getName());
	                response.setDescription(group.getDescription());
	                response.setCreatedBy(group.getCreatedBy());

                  // Populate members
                  List<MemberDto> members = memberRepository.findByGroupId(group.getId()).stream()
                      .map(m -> new MemberDto(m.getUserEmail(), m.getRole()))
                      .toList();
                  response.setMembers(members);

	                return response;
	            })
	            .toList();
	}

	/**
	 * Retrieve members of a group
	 * 
	 * @param groupId Group ID
	 * @return List of GroupMember objects
	 * @throws RuntimeException if group is not found
	 */
	@Override
	public List<GroupMember> getGroupMembers(Long groupId) {
		Group group = groupRepository.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));
		List<GroupMember> members = memberRepository.findByGroupId(group.getId()).stream().toList();
		return members;
	}

}
