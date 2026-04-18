package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {
}
