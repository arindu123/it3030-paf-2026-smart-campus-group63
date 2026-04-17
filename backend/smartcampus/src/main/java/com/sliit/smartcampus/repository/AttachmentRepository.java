package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByTicketIdOrderByUploadedAtAsc(Long ticketId);
    long countByTicketId(Long ticketId);
    Optional<Attachment> findByIdAndTicketId(Long id, Long ticketId);
}
