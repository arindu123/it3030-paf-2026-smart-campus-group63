package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.BookingRequest;
import com.sliit.smartcampus.dto.BookingDecisionRequest;
import com.sliit.smartcampus.dto.BookingResponse;

import java.util.List;

public interface BookingService {
    BookingResponse createBooking(BookingRequest request, String actorEmail);
    List<BookingResponse> getAllBookings();
    List<BookingResponse> getBookingsByUserEmail(String userEmail);
    BookingResponse getBookingById(Long id);
    void deleteBooking(Long id, String actorEmail);
    BookingResponse approveBooking(Long id, String actorEmail);
    BookingResponse rejectBooking(Long id, BookingDecisionRequest request, String actorEmail);
}
