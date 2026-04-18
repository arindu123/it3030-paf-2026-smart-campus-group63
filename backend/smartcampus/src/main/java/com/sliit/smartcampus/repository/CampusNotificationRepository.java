package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.entity.CampusNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CampusNotificationRepository extends JpaRepository<CampusNotification, Long> {

    List<CampusNotification> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);

    @Query("select n from CampusNotification n where n.id = :id and n.recipientEmail = :recipientEmail")
    Optional<CampusNotification> findByIdAndRecipientEmail(@Param("id") Long id,
                                                           @Param("recipientEmail") String recipientEmail);

    long countByRecipientEmailAndIsReadFalse(String recipientEmail);
}