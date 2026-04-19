package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.BookingRequest;
import com.sliit.smartcampus.dto.BookingDecisionRequest;
import com.sliit.smartcampus.dto.BookingResponse;
import com.sliit.smartcampus.service.BookingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public BookingResponse createBooking(@RequestBody BookingRequest request,
                                         @RequestHeader("X-User-Email") String actorEmail) {
        return bookingService.createBooking(request, actorEmail);
    }

    @GetMapping
    public List<BookingResponse> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/{id}")
    public BookingResponse getBookingById(@PathVariable Long id) {
        return bookingService.getBookingById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteBooking(@PathVariable Long id,
                                @RequestHeader("X-User-Email") String actorEmail) {
        bookingService.deleteBooking(id, actorEmail);
        return "Booking cancelled successfully";
    }

    @PatchMapping("/{id}/approve")
    public BookingResponse approveBooking(@PathVariable Long id,
                                          @RequestHeader("X-User-Email") String actorEmail) {
        return bookingService.approveBooking(id, actorEmail);
    }

    @PatchMapping("/{id}/reject")
    public BookingResponse rejectBooking(@PathVariable Long id,
                                         @RequestBody(required = false) BookingDecisionRequest request,
                                         @RequestHeader("X-User-Email") String actorEmail) {
        BookingDecisionRequest safeRequest = request == null ? new BookingDecisionRequest() : request;
        return bookingService.rejectBooking(id, safeRequest, actorEmail);
    }
}
