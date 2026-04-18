package com.sliit.smartcampus.service;

import com.sliit.smartcampus.entity.Ticket;
import com.sliit.smartcampus.entity.TicketComment;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.TicketStatus;
import com.sliit.smartcampus.enums.UserRole;
import com.sliit.smartcampus.exception.ForbiddenException;
import com.sliit.smartcampus.exception.UnauthorizedException;
import com.sliit.smartcampus.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class TicketAuthorizationService {

    private final UserRepository userRepository;

    public TicketAuthorizationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User requireActor(String actorEmail) {
        if (actorEmail == null || actorEmail.isBlank()) {
            throw new UnauthorizedException("X-User-Email header is required");
        }

        return userRepository.findByEmail(actorEmail)
            .orElseThrow(() -> new UnauthorizedException("User not found for email: " + actorEmail));
    }

    public void assertCanViewTicket(User actor, Ticket ticket) {
        if (actor.getRole() == UserRole.ADMIN || actor.getRole() == UserRole.TECHNICIAN) {
            return;
        }

        if (isTicketOwner(actor, ticket)) {
            return;
        }

        throw new ForbiddenException("You are not allowed to view this ticket");
    }

    public void assertCanCreateTicket(User actor) {
        if (actor.getRole() == UserRole.USER || actor.getRole() == UserRole.ADMIN || actor.getRole() == UserRole.TECHNICIAN) {
            return;
        }

        throw new ForbiddenException("You are not allowed to create tickets");
    }

    public void assertCanAssign(User actor) {
        if (actor.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("Only ADMIN can assign technicians");
        }
    }

    public void assertCanReject(User actor) {
        if (actor.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("Only ADMIN can reject tickets");
        }
    }

    public void assertCanUpdateStatus(User actor, Ticket ticket, TicketStatus newStatus) {
        switch (newStatus) {
            case IN_PROGRESS, RESOLVED -> {
                if (actor.getRole() == UserRole.ADMIN) {
                    return;
                }

                if (actor.getRole() == UserRole.TECHNICIAN && isAssignedTechnician(actor, ticket)) {
                    return;
                }

                throw new ForbiddenException("Only ADMIN or assigned TECHNICIAN can move ticket to " + newStatus);
            }
            case CLOSED -> {
                if (actor.getRole() != UserRole.ADMIN) {
                    throw new ForbiddenException("Only ADMIN can close tickets");
                }
            }
            case REJECTED -> assertCanReject(actor);
            case OPEN -> throw new ForbiddenException("Status cannot be manually set back to OPEN");
        }
    }

    public void assertCanUpdateResolution(User actor, Ticket ticket) {
        if (actor.getRole() == UserRole.ADMIN) {
            return;
        }

        if (actor.getRole() == UserRole.TECHNICIAN && isAssignedTechnician(actor, ticket)) {
            return;
        }

        throw new ForbiddenException("Only ADMIN or assigned TECHNICIAN can add resolution notes");
    }

    public void assertCanManageProgress(User actor, Ticket ticket) {
        if (actor.getRole() == UserRole.ADMIN) {
            return;
        }

        if (actor.getRole() == UserRole.TECHNICIAN && isAssignedTechnician(actor, ticket)) {
            return;
        }

        throw new ForbiddenException("Only ADMIN or assigned TECHNICIAN can add progress updates");
    }

    public void assertCanUploadAttachment(User actor, Ticket ticket) {
        if (actor.getRole() == UserRole.ADMIN) {
            return;
        }

        if (actor.getRole() == UserRole.TECHNICIAN && isAssignedTechnician(actor, ticket)) {
            return;
        }

        if (isTicketOwner(actor, ticket)) {
            return;
        }

        throw new ForbiddenException("You are not allowed to upload attachments for this ticket");
    }

    public void assertCanComment(User actor, Ticket ticket) {
        if (actor.getRole() == UserRole.ADMIN) {
            return;
        }

        if (actor.getRole() == UserRole.TECHNICIAN) {
            if (isAssignedTechnician(actor, ticket)) {
                return;
            }
            throw new ForbiddenException("Technician must be assigned to comment on this ticket");
        }

        if (!isTicketOwner(actor, ticket)) {
            throw new ForbiddenException("Users can comment only on their own tickets");
        }
    }

    public void assertCanEditComment(User actor, TicketComment comment) {
        if (actor.getRole() == UserRole.ADMIN) {
            return;
        }

        if (comment.getOwnerEmail().equalsIgnoreCase(actor.getEmail())) {
            return;
        }

        throw new ForbiddenException("You can edit only your own comments");
    }

    public void assertCanDeleteComment(User actor, TicketComment comment) {
        if (actor.getRole() == UserRole.ADMIN) {
            return;
        }

        if (comment.getOwnerEmail().equalsIgnoreCase(actor.getEmail())) {
            return;
        }

        throw new ForbiddenException("You can delete only your own comments");
    }

    public boolean isTicketOwner(User actor, Ticket ticket) {
        if (ticket.getCreatedByUser() != null && ticket.getCreatedByUser().getId() != null) {
            return ticket.getCreatedByUser().getId().equals(actor.getId());
        }

        return ticket.getCreatedBy() != null && ticket.getCreatedBy().equalsIgnoreCase(actor.getEmail());
    }

    public boolean isAssignedTechnician(User actor, Ticket ticket) {
        if (ticket.getAssignedToUser() != null && ticket.getAssignedToUser().getId() != null) {
            return ticket.getAssignedToUser().getId().equals(actor.getId());
        }

        return ticket.getAssignedTo() != null && ticket.getAssignedTo().equalsIgnoreCase(actor.getEmail());
    }
}
