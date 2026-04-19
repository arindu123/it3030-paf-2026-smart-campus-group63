package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.entity.Booking;
import com.sliit.smartcampus.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId AND b.date = :date AND b.status = :status " +
           "AND ((b.startTime < :endTime AND b.endTime > :startTime))")
    List<Booking> findConflictingBookings(
            @Param("resourceId") Long resourceId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("status") BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE LOWER(b.createdBy) = LOWER(:userEmail) ORDER BY b.createdAt DESC")
    List<Booking> findByCreatedByEmail(@Param("userEmail") String userEmail);
}
