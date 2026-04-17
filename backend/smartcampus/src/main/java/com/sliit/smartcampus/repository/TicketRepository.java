package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.entity.Ticket;
import com.sliit.smartcampus.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findByCreatedByUser_IdOrderByCreatedAtDesc(Long createdByUserId);
    List<Ticket> findByCreatedByOrderByCreatedAtDesc(String createdBy);
    List<Ticket> findByAssignedToUser_IdOrderByCreatedAtDesc(Long assignedToUserId);
    List<Ticket> findAllByOrderByCreatedAtDesc();
}
