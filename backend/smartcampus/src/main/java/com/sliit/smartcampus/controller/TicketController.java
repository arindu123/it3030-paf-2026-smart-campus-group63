package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.ticket.TicketAssignmentRequest;
import com.sliit.smartcampus.dto.ticket.TicketCreateRequest;
import com.sliit.smartcampus.dto.ticket.TicketProgressCreateRequest;
import com.sliit.smartcampus.dto.ticket.TicketProgressUpdateResponse;
import com.sliit.smartcampus.dto.ticket.TicketRejectRequest;
import com.sliit.smartcampus.dto.ticket.TicketResolutionRequest;
import com.sliit.smartcampus.dto.ticket.TicketResponse;
import com.sliit.smartcampus.dto.ticket.TicketStatusUpdateRequest;
import com.sliit.smartcampus.enums.TicketStatus;
import com.sliit.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;
    private static final String ACTOR_HEADER = "X-User-Email";

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketResponse createTicket(@Valid @RequestBody TicketCreateRequest request,
                                       @RequestHeader(ACTOR_HEADER) String actorEmail) {
        return ticketService.createTicket(request, actorEmail);
    }

    @GetMapping
    public List<TicketResponse> getAllTickets(@RequestHeader(ACTOR_HEADER) String actorEmail,
                                              @RequestParam(required = false) TicketStatus status) {
        return ticketService.getAllTickets(actorEmail, status);
    }

    @GetMapping("/{id}")
    public TicketResponse getTicketById(@PathVariable Long id,
                                        @RequestHeader(ACTOR_HEADER) String actorEmail) {
        return ticketService.getTicketById(id, actorEmail);
    }

    @PatchMapping("/{id}/status")
    public TicketResponse updateStatus(@PathVariable Long id,
                                       @Valid @RequestBody TicketStatusUpdateRequest request,
                                       @RequestHeader(ACTOR_HEADER) String actorEmail) {
        return ticketService.updateStatus(id, request, actorEmail);
    }

    @PatchMapping("/{id}/resolution")
    public TicketResponse updateResolutionNote(@PathVariable Long id,
                                               @Valid @RequestBody TicketResolutionRequest request,
                                               @RequestHeader(ACTOR_HEADER) String actorEmail) {
        return ticketService.updateResolutionNote(id, request, actorEmail);
    }

    @PatchMapping("/{id}/assign")
    public TicketResponse assignTechnician(@PathVariable Long id,
                                           @Valid @RequestBody TicketAssignmentRequest request,
                                           @RequestHeader(ACTOR_HEADER) String actorEmail) {
        return ticketService.assignTechnician(id, request, actorEmail);
    }

    @PatchMapping("/{id}/reject")
    public TicketResponse rejectTicket(@PathVariable Long id,
                                       @Valid @RequestBody TicketRejectRequest request,
                                       @RequestHeader(ACTOR_HEADER) String actorEmail) {
        return ticketService.rejectTicket(id, request, actorEmail);
    }

    @PostMapping("/{id}/progress-updates")
    @ResponseStatus(HttpStatus.CREATED)
    public TicketProgressUpdateResponse addProgressUpdate(@PathVariable Long id,
                                                          @Valid @RequestBody TicketProgressCreateRequest request,
                                                          @RequestHeader(ACTOR_HEADER) String actorEmail) {
        return ticketService.addProgressUpdate(id, request, actorEmail);
    }

    @GetMapping("/{id}/progress-updates")
    public List<TicketProgressUpdateResponse> getProgressUpdates(@PathVariable Long id,
                                                                 @RequestHeader(ACTOR_HEADER) String actorEmail) {
        return ticketService.getProgressUpdates(id, actorEmail);
    }

    @DeleteMapping("/{id}")
    public void deleteTicket(@PathVariable Long id,
                             @RequestHeader(ACTOR_HEADER) String actorEmail) {
        ticketService.deleteTicket(id, actorEmail);
    }
}
