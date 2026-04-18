package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.ticket.AttachmentResponse;
import com.sliit.smartcampus.dto.ticket.TicketAssignmentRequest;
import com.sliit.smartcampus.dto.ticket.TicketCommentResponse;
import com.sliit.smartcampus.dto.ticket.TicketCreateRequest;
import com.sliit.smartcampus.dto.ticket.TicketProgressCreateRequest;
import com.sliit.smartcampus.dto.ticket.TicketProgressUpdateResponse;
import com.sliit.smartcampus.dto.ticket.TicketRejectRequest;
import com.sliit.smartcampus.dto.ticket.TicketResolutionRequest;
import com.sliit.smartcampus.dto.ticket.TicketResponse;
import com.sliit.smartcampus.dto.ticket.TicketStatusUpdateRequest;
import com.sliit.smartcampus.entity.Ticket;
import com.sliit.smartcampus.entity.TicketComment;
import com.sliit.smartcampus.entity.TicketProgressUpdate;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.TicketStatus;
import com.sliit.smartcampus.enums.UserRole;
import com.sliit.smartcampus.exception.BadRequestException;
import com.sliit.smartcampus.exception.ForbiddenException;
import com.sliit.smartcampus.exception.NotFoundException;
import com.sliit.smartcampus.repository.AttachmentRepository;
import com.sliit.smartcampus.repository.ResourceRepository;
import com.sliit.smartcampus.repository.TicketCommentRepository;
import com.sliit.smartcampus.repository.TicketProgressUpdateRepository;
import com.sliit.smartcampus.repository.TicketRepository;
import com.sliit.smartcampus.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final AttachmentRepository attachmentRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final TicketProgressUpdateRepository ticketProgressUpdateRepository;
    private final TicketAuthorizationService ticketAuthorizationService;
    private final TicketNotificationService ticketNotificationService;

    public TicketService(TicketRepository ticketRepository,
                         ResourceRepository resourceRepository,
                         UserRepository userRepository,
                         AttachmentRepository attachmentRepository,
                         TicketCommentRepository ticketCommentRepository,
                         TicketProgressUpdateRepository ticketProgressUpdateRepository,
                         TicketAuthorizationService ticketAuthorizationService,
                         TicketNotificationService ticketNotificationService) {
        this.ticketRepository = ticketRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.attachmentRepository = attachmentRepository;
        this.ticketCommentRepository = ticketCommentRepository;
        this.ticketProgressUpdateRepository = ticketProgressUpdateRepository;
        this.ticketAuthorizationService = ticketAuthorizationService;
        this.ticketNotificationService = ticketNotificationService;
    }

    public TicketResponse createTicket(TicketCreateRequest request, String actorEmail) {
        User actor = ticketAuthorizationService.requireActor(actorEmail);
        ticketAuthorizationService.assertCanCreateTicket(actor);
        validateCreateRequest(request);

        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle().trim());
        ticket.setDescription(request.getDescription().trim());
        ticket.setPriority(request.getPriority());
        ticket.setCategory(request.getCategory());
        ticket.setCreatedBy(actor.getEmail());
        ticket.setCreatedByUser(actor);
        ticket.setContactNumber(request.getPreferredContactDetails().trim());
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setResolutionNote(null);
        ticket.setRejectionReason(null);

        if (request.getRelatedResourceId() != null) {
            var resource = resourceRepository.findById(request.getRelatedResourceId())
                .orElseThrow(() -> new BadRequestException("Resource not found: " + request.getRelatedResourceId()));
            ticket.setResourceRef(resource);
            ticket.setResource(resource.getName());
            ticket.setLocation(
                (request.getRelatedLocation() != null && !request.getRelatedLocation().isBlank())
                    ? request.getRelatedLocation().trim()
                    : resource.getLocation()
            );
        } else {
            ticket.setResource(
                (request.getRelatedResource() == null || request.getRelatedResource().isBlank())
                    ? null
                    : request.getRelatedResource().trim()
            );
            ticket.setLocation(
                (request.getRelatedLocation() == null || request.getRelatedLocation().isBlank())
                    ? null
                    : request.getRelatedLocation().trim()
            );
        }

        Ticket saved = ticketRepository.save(ticket);
        return toTicketResponse(saved);
    }

    public List<TicketResponse> getAllTickets(String actorEmail, TicketStatus status) {
        User actor = ticketAuthorizationService.requireActor(actorEmail);
        List<Ticket> tickets = findTicketsVisibleToActor(actor);

        if (status != null) {
            tickets = tickets.stream()
                .filter(ticket -> status.equals(ticket.getStatus()))
                .collect(Collectors.toList());
        }

        return tickets.stream()
            .map(this::toTicketResponse)
            .toList();
    }

    public TicketResponse getTicketById(Long id, String actorEmail) {
        User actor = ticketAuthorizationService.requireActor(actorEmail);
        Ticket ticket = getTicketEntityForActor(id, actor);
        return toTicketResponse(ticket);
    }

    public TicketResponse updateStatus(Long id,
                                       TicketStatusUpdateRequest request,
                                       String actorEmail) {
        User actor = ticketAuthorizationService.requireActor(actorEmail);
        Ticket ticket = getTicketEntityForActor(id, actor);

        TicketStatus nextStatus = request.getStatus();
        if (nextStatus == TicketStatus.REJECTED) {
            throw new BadRequestException("Use /api/tickets/{id}/reject endpoint with a reason to reject a ticket");
        }
        ticketAuthorizationService.assertCanUpdateStatus(actor, ticket, nextStatus);

        TicketStatus currentStatus = ticket.getStatus();
        if (!TicketWorkflowRules.canTransition(currentStatus, nextStatus)) {
            throw new BadRequestException(
                "Invalid status transition from " + currentStatus + " to " + nextStatus
            );
        }

        ticket.setStatus(nextStatus);
        if (nextStatus != TicketStatus.REJECTED) {
            ticket.setRejectionReason(null);
        }

        Ticket saved = ticketRepository.save(ticket);
        ticketNotificationService.notifyTicketOwnerForStatusChange(saved, actor.getEmail(), currentStatus, nextStatus);
        return toTicketResponse(saved);
    }

    public TicketResponse rejectTicket(Long id,
                                       TicketRejectRequest request,
                                       String actorEmail) {
        User actor = ticketAuthorizationService.requireActor(actorEmail);
        Ticket ticket = getTicketEntityForActor(id, actor);

        ticketAuthorizationService.assertCanReject(actor);
        TicketStatus currentStatus = ticket.getStatus();

        if (!TicketWorkflowRules.canTransition(currentStatus, TicketStatus.REJECTED)) {
            throw new BadRequestException(
                "Ticket in " + currentStatus + " cannot be rejected"
            );
        }

        ticket.setStatus(TicketStatus.REJECTED);
        ticket.setRejectionReason(request.getReason().trim());
        Ticket saved = ticketRepository.save(ticket);
        ticketNotificationService.notifyTicketOwnerForStatusChange(saved, actor.getEmail(), currentStatus, TicketStatus.REJECTED);
        return toTicketResponse(saved);
    }

    public TicketResponse updateResolutionNote(Long id,
                                               TicketResolutionRequest request,
                                               String actorEmail) {
        User actor = ticketAuthorizationService.requireActor(actorEmail);
        Ticket ticket = getTicketEntityForActor(id, actor);

        ticketAuthorizationService.assertCanUpdateResolution(actor, ticket);

        if (ticket.getStatus() != TicketStatus.IN_PROGRESS && ticket.getStatus() != TicketStatus.RESOLVED) {
            throw new BadRequestException("Resolution notes can be added only in IN_PROGRESS or RESOLVED status");
        }

        ticket.setResolutionNote(request.getResolutionNote().trim());
        return toTicketResponse(ticketRepository.save(ticket));
    }

    public TicketResponse assignTechnician(Long id,
                                           TicketAssignmentRequest request,
                                           String actorEmail) {
        User actor = ticketAuthorizationService.requireActor(actorEmail);
        Ticket ticket = getTicketEntityForActor(id, actor);

        ticketAuthorizationService.assertCanAssign(actor);

        User technician = userRepository.findByEmail(request.getTechnicianEmail())
            .orElseThrow(() -> new NotFoundException("Technician not found: " + request.getTechnicianEmail()));

        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new BadRequestException("Assigned user must have TECHNICIAN role");
        }

        ticket.setAssignedToUser(technician);
        ticket.setAssignedTo(technician.getEmail());
        return toTicketResponse(ticketRepository.save(ticket));
    }

    public TicketProgressUpdateResponse addProgressUpdate(Long ticketId,
                                                          TicketProgressCreateRequest request,
                                                          String actorEmail) {
        User actor = ticketAuthorizationService.requireActor(actorEmail);
        Ticket ticket = getTicketEntityForActor(ticketId, actor);
        ticketAuthorizationService.assertCanManageProgress(actor, ticket);

        TicketProgressUpdate progressUpdate = new TicketProgressUpdate();
        progressUpdate.setTicket(ticket);
        progressUpdate.setUpdateText(request.getUpdateText().trim());
        progressUpdate.setUpdatedBy(actor.getEmail());
        progressUpdate.setUpdatedByRole(actor.getRole());
        progressUpdate.setUpdatedByUser(actor);

        TicketProgressUpdate saved = ticketProgressUpdateRepository.save(progressUpdate);
        return toProgressResponse(saved);
    }

    public List<TicketProgressUpdateResponse> getProgressUpdates(Long ticketId, String actorEmail) {
        User actor = ticketAuthorizationService.requireActor(actorEmail);
        Ticket ticket = getTicketEntityForActor(ticketId, actor);
        ticketAuthorizationService.assertCanViewTicket(actor, ticket);

        return ticketProgressUpdateRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
            .stream()
            .map(this::toProgressResponse)
            .toList();
    }

    public void deleteTicket(Long id, String actorEmail) {
        User actor = ticketAuthorizationService.requireActor(actorEmail);
        Ticket ticket = getTicketEntityForActor(id, actor);

        boolean isAdmin = actor.getRole() == UserRole.ADMIN;
        boolean isOwner = ticketAuthorizationService.isTicketOwner(actor, ticket);
        boolean isOpen = ticket.getStatus() == TicketStatus.OPEN;

        if (!isAdmin && !(isOwner && isOpen)) {
            throw new ForbiddenException("Only ADMIN or the owner of an OPEN ticket can delete this ticket");
        }

        ticketRepository.delete(ticket);
    }

    public Ticket getTicketEntityForActor(Long ticketId, User actor) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new NotFoundException("Ticket not found: " + ticketId));

        ticketAuthorizationService.assertCanViewTicket(actor, ticket);
        return ticket;
    }

    private List<Ticket> findTicketsVisibleToActor(User actor) {
        if (actor.getRole() == UserRole.ADMIN || actor.getRole() == UserRole.TECHNICIAN) {
            return ticketRepository.findAllByOrderByCreatedAtDesc();
        }

        List<Ticket> tickets = ticketRepository.findByCreatedByUser_IdOrderByCreatedAtDesc(actor.getId());
        if (!tickets.isEmpty()) {
            return tickets;
        }

        return ticketRepository.findByCreatedByOrderByCreatedAtDesc(actor.getEmail());
    }

    private void validateCreateRequest(TicketCreateRequest request) {
        boolean hasResourceId = request.getRelatedResourceId() != null;
        boolean hasResourceText = request.getRelatedResource() != null && !request.getRelatedResource().isBlank();
        boolean hasLocation = request.getRelatedLocation() != null && !request.getRelatedLocation().isBlank();

        if (!hasResourceId && !hasResourceText && !hasLocation) {
            throw new BadRequestException("Either relatedResourceId, relatedResource, or relatedLocation is required");
        }
    }

    public TicketResponse toTicketResponse(Ticket ticket) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setTitle(ticket.getTitle());
        response.setCategory(ticket.getCategory());
        response.setDescription(ticket.getDescription());
        response.setPriority(ticket.getPriority());
        response.setPreferredContactDetails(ticket.getContactNumber());
        response.setRelatedResource(ticket.getResource());
        response.setRelatedResourceId(ticket.getResourceRef() != null ? ticket.getResourceRef().getId() : null);
        response.setRelatedLocation(ticket.getLocation());
        response.setCreatedBy(ticket.getCreatedBy());
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());
        response.setStatus(ticket.getStatus());
        response.setAssignedTo(ticket.getAssignedTo());
        response.setResolutionNote(ticket.getResolutionNote());
        response.setRejectionReason(ticket.getRejectionReason());

        response.setAttachments(
            attachmentRepository.findByTicketIdOrderByUploadedAtAsc(ticket.getId())
                .stream()
                .map(attachment -> {
                    AttachmentResponse attachmentResponse = new AttachmentResponse();
                    attachmentResponse.setId(attachment.getId());
                    attachmentResponse.setFileName(attachment.getFileName());
                    attachmentResponse.setFileType(attachment.getFileType());
                    attachmentResponse.setFileSize(attachment.getFileSize());
                    attachmentResponse.setUploadedAt(attachment.getUploadedAt());
                    attachmentResponse.setDownloadUrl("/api/tickets/attachments/" + attachment.getId() + "/file");
                    return attachmentResponse;
                })
                .toList()
        );

        response.setComments(
            ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId())
                .stream()
                .map(this::toCommentResponse)
                .toList()
        );

        response.setProgressUpdates(
            ticketProgressUpdateRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId())
                .stream()
                .map(this::toProgressResponse)
                .toList()
        );

        return response;
    }

    private TicketCommentResponse toCommentResponse(TicketComment comment) {
        TicketCommentResponse response = new TicketCommentResponse();
        response.setId(comment.getId());
        response.setCommentText(comment.getCommentText());
        response.setOwner(comment.getOwnerEmail());
        response.setOwnerRole(comment.getOwnerRole());
        response.setCreatedAt(comment.getCreatedAt());
        response.setUpdatedAt(comment.getUpdatedAt());
        return response;
    }

    private TicketProgressUpdateResponse toProgressResponse(TicketProgressUpdate progressUpdate) {
        TicketProgressUpdateResponse response = new TicketProgressUpdateResponse();
        response.setId(progressUpdate.getId());
        response.setUpdateText(progressUpdate.getUpdateText());
        response.setUpdatedBy(progressUpdate.getUpdatedBy());
        response.setUpdatedByRole(progressUpdate.getUpdatedByRole());
        response.setCreatedAt(progressUpdate.getCreatedAt());
        return response;
    }
}
