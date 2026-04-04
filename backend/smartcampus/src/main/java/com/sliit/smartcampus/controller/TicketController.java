package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.entity.Ticket;
import com.sliit.smartcampus.enums.TicketStatus;
import com.sliit.smartcampus.service.TicketService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public Ticket createTicket(@RequestBody Ticket ticket) {
        return ticketService.createTicket(ticket);
    }

    @GetMapping
    public List<Ticket> getAllTickets() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/status")
    public List<Ticket> getByStatus(@RequestParam TicketStatus status) {
        return ticketService.getTicketsByStatus(status);
    }

    @GetMapping("/{id}")
    public Ticket getTicketById(@PathVariable Long id) {
        return ticketService.getTicketById(id);
    }

    @PutMapping("/{id}/status")
    public Ticket updateStatus(@PathVariable Long id,
                               @RequestParam TicketStatus status) {
        return ticketService.updateStatus(id, status);
    }

    @PutMapping("/{id}/resolution-note")
    public Ticket updateResolutionNote(@PathVariable Long id,
                                       @RequestParam String note) {
        return ticketService.updateResolutionNote(id, note);
    }

    @PutMapping("/{id}/assign")
    public Ticket assignTechnician(@PathVariable Long id,
                                   @RequestParam String tech) {
        return ticketService.assignTechnician(id, tech);
    }

    @DeleteMapping("/{id}")
    public void deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
    }
}
