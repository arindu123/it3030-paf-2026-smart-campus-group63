package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.entity.TicketProgressUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketProgressUpdateRepository extends JpaRepository<TicketProgressUpdate, Long> {
    List<TicketProgressUpdate> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
