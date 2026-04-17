package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.ticket.TicketCommentCreateRequest;
import com.sliit.smartcampus.dto.ticket.TicketCommentResponse;
import com.sliit.smartcampus.dto.ticket.TicketCommentUpdateRequest;
import com.sliit.smartcampus.entity.Ticket;
import com.sliit.smartcampus.entity.TicketComment;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.exception.NotFoundException;
import com.sliit.smartcampus.repository.TicketCommentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketCommentService {

    private final TicketCommentRepository ticketCommentRepository;
    private final TicketService ticketService;
    private final TicketAuthorizationService ticketAuthorizationService;
    private final TicketNotificationService ticketNotificationService;

    public TicketCommentService(TicketCommentRepository ticketCommentRepository,
                                TicketService ticketService,
                                TicketAuthorizationService ticketAuthorizationService,
                                TicketNotificationService ticketNotificationService) {
        this.ticketCommentRepository = ticketCommentRepository;
        this.ticketService = ticketService;
        this.ticketAuthorizationService = ticketAuthorizationService;
        this.ticketNotificationService = ticketNotificationService;
    }

    public TicketCommentResponse addComment(Long ticketId,
                                            TicketCommentCreateRequest request,
                                            String actorEmail) {
        User actor = ticketAuthorizationService.requireActor(actorEmail);
        Ticket ticket = ticketService.getTicketEntityForActor(ticketId, actor);

        ticketAuthorizationService.assertCanComment(actor, ticket);

        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setCommentText(request.getCommentText().trim());
        comment.setOwnerEmail(actor.getEmail());
        comment.setOwnerRole(actor.getRole());
        comment.setOwnerUser(actor);

        TicketComment saved = ticketCommentRepository.save(comment);
        ticketNotificationService.notifyTicketOwnerForNewComment(ticket, actor.getEmail());
        return toResponse(saved);
    }

    public List<TicketCommentResponse> getComments(Long ticketId, String actorEmail) {
        User actor = ticketAuthorizationService.requireActor(actorEmail);
        Ticket ticket = ticketService.getTicketEntityForActor(ticketId, actor);
        ticketAuthorizationService.assertCanViewTicket(actor, ticket);

        return ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    public TicketCommentResponse updateComment(Long commentId,
                                               TicketCommentUpdateRequest request,
                                               String actorEmail) {
        User actor = ticketAuthorizationService.requireActor(actorEmail);

        TicketComment comment = ticketCommentRepository.findById(commentId)
            .orElseThrow(() -> new NotFoundException("Comment not found: " + commentId));

        ticketAuthorizationService.assertCanEditComment(actor, comment);
        comment.setCommentText(request.getCommentText().trim());

        return toResponse(ticketCommentRepository.save(comment));
    }

    public void deleteComment(Long commentId, String actorEmail) {
        User actor = ticketAuthorizationService.requireActor(actorEmail);

        TicketComment comment = ticketCommentRepository.findById(commentId)
            .orElseThrow(() -> new NotFoundException("Comment not found: " + commentId));

        ticketAuthorizationService.assertCanDeleteComment(actor, comment);
        ticketCommentRepository.delete(comment);
    }

    private TicketCommentResponse toResponse(TicketComment comment) {
        TicketCommentResponse response = new TicketCommentResponse();
        response.setId(comment.getId());
        response.setCommentText(comment.getCommentText());
        response.setOwner(comment.getOwnerEmail());
        response.setOwnerRole(comment.getOwnerRole());
        response.setCreatedAt(comment.getCreatedAt());
        response.setUpdatedAt(comment.getUpdatedAt());
        return response;
    }
}
