package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.ticket.TicketCommentCreateRequest;
import com.sliit.smartcampus.dto.ticket.TicketCommentResponse;
import com.sliit.smartcampus.dto.ticket.TicketCommentUpdateRequest;
import com.sliit.smartcampus.service.TicketCommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/tickets")
public class TicketCommentController {

    private static final String ACTOR_HEADER = "X-User-Email";
    private final TicketCommentService ticketCommentService;

    public TicketCommentController(TicketCommentService ticketCommentService) {
        this.ticketCommentService = ticketCommentService;
    }

    @PostMapping("/{ticketId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public TicketCommentResponse addComment(@PathVariable Long ticketId,
                                            @Valid @RequestBody TicketCommentCreateRequest request,
                                            @RequestHeader(ACTOR_HEADER) String actorEmail) {
        return ticketCommentService.addComment(ticketId, request, actorEmail);
    }

    @GetMapping("/{ticketId}/comments")
    public List<TicketCommentResponse> getComments(@PathVariable Long ticketId,
                                                   @RequestHeader(ACTOR_HEADER) String actorEmail) {
        return ticketCommentService.getComments(ticketId, actorEmail);
    }

    @PatchMapping("/comments/{commentId}")
    public TicketCommentResponse updateComment(@PathVariable Long commentId,
                                               @Valid @RequestBody TicketCommentUpdateRequest request,
                                               @RequestHeader(ACTOR_HEADER) String actorEmail) {
        return ticketCommentService.updateComment(commentId, request, actorEmail);
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId,
                                              @RequestHeader(ACTOR_HEADER) String actorEmail) {
        ticketCommentService.deleteComment(commentId, actorEmail);
        return ResponseEntity.noContent().build();
    }
}
