package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.entity.TicketNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketNotificationRepository extends JpaRepository<TicketNotification, Long> {
    List<TicketNotification> findByRecipientUserIdOrderByCreatedAtDesc(Long recipientUserId);
    List<TicketNotification> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);
    Optional<TicketNotification> findByIdAndRecipientEmail(Long id, String recipientEmail);
    long deleteByRecipientEmail(String recipientEmail);
}
