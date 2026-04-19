package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.BookingRequest;
import com.sliit.smartcampus.dto.BookingResponse;
import com.sliit.smartcampus.entity.Booking;
import com.sliit.smartcampus.entity.Resource;
import com.sliit.smartcampus.enums.BookingStatus;
import com.sliit.smartcampus.repository.BookingRepository;
import com.sliit.smartcampus.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

    public BookingServiceImpl(BookingRepository bookingRepository,
                              ResourceRepository resourceRepository) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
    }

    private BookingResponse convertToResponse(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getResource() != null ? booking.getResource().getName() : null,
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getPurpose(),
                booking.getExpectedAttendees(),
                booking.getStatus().name()
        );
    }

    @Override
    public BookingResponse createBooking(BookingRequest request) {
        String resourceName = request.getResourceName() == null ? "" : request.getResourceName().trim();
        if (resourceName.isEmpty()) {
            throw new RuntimeException("Resource name is required");
        }

        Resource resource = resourceRepository.findFirstByNameIgnoreCase(resourceName)
                .orElseThrow(() -> new RuntimeException("Resource not found: " + resourceName));

        Booking booking = new Booking();
        booking.setResource(resource);
        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);

        Booking savedBooking = bookingRepository.save(booking);
        return convertToResponse(savedBooking);
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        return convertToResponse(booking);
    }

    @Override
    public void deleteBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        bookingRepository.delete(booking);
    }
}
