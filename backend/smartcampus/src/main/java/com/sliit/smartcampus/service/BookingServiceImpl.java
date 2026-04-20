package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.BookingRequest;
import com.sliit.smartcampus.dto.BookingDecisionRequest;
import com.sliit.smartcampus.dto.BookingResponse;
import com.sliit.smartcampus.entity.Booking;
import com.sliit.smartcampus.entity.Resource;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.BookingStatus;
import com.sliit.smartcampus.enums.CampusNotificationType;
import com.sliit.smartcampus.enums.UserRole;
import com.sliit.smartcampus.exception.ForbiddenException;
import com.sliit.smartcampus.exception.NotFoundException;
import com.sliit.smartcampus.repository.BookingRepository;
import com.sliit.smartcampus.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final TicketAuthorizationService ticketAuthorizationService;
    private final CampusNotificationService campusNotificationService;

    public BookingServiceImpl(BookingRepository bookingRepository,
                              ResourceRepository resourceRepository,
                              TicketAuthorizationService ticketAuthorizationService,
                              CampusNotificationService campusNotificationService) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.ticketAuthorizationService = ticketAuthorizationService;
        this.campusNotificationService = campusNotificationService;
    }

    private BookingResponse convertToResponse(Booking booking) {
        BookingResponse response = new BookingResponse(
                booking.getId(),
                booking.getResource() != null ? booking.getResource().getName() : null,
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getPurpose(),
                booking.getExpectedAttendees(),
                booking.getStatus().name()
        );
            response.setCreatedBy(booking.getCreatedBy());
            response.setCreatedByFullName(booking.getCreatedByUser() != null ? booking.getCreatedByUser().getFullName() : null);
            response.setRejectionReason(booking.getRejectionReason());
            response.setCreatedAt(booking.getCreatedAt() == null ? null : booking.getCreatedAt().toString());
            return response;
    }

    @Override
    public BookingResponse createBooking(BookingRequest request, String actorEmail) {
        User actor = ticketAuthorizationService.requireActor(actorEmail);

        String resourceName = request.getResourceName() == null ? "" : request.getResourceName().trim();
        if (resourceName.isEmpty()) {
            throw new RuntimeException("Resource name is required");
        }

        Resource resource = resourceRepository.findFirstByNameIgnoreCase(resourceName)
                .orElseThrow(() -> new RuntimeException("Resource not found: " + resourceName));

        // Check for time slot conflicts with approved bookings
        List<Booking> conflictingBookings = bookingRepository.findConflictingBookings(
                resource.getId(),
                request.getDate(),
                request.getStartTime(),
                request.getEndTime(),
                BookingStatus.APPROVED
        );

        if (!conflictingBookings.isEmpty()) {
            throw new RuntimeException("Time slot is already booked for this resource on the selected date. " +
                    "Please choose a different time or date.");
        }

        Booking booking = new Booking();
        booking.setResource(resource);
        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedBy(actor.getEmail());
        booking.setCreatedByUser(actor);

        Booking savedBooking = bookingRepository.save(booking);
        campusNotificationService.notifyEmail(
            actor.getEmail(),
            actor.getRole(),
            CampusNotificationType.BOOKING_REQUEST_SUBMITTED,
            "Booking request submitted",
            "Your booking for " + resource.getName() + " on " + request.getDate() + " is now pending review.",
            "BOOKING",
            savedBooking.getId()
        );
        campusNotificationService.notifyRole(
            UserRole.ADMIN,
            actor.getEmail(),
            CampusNotificationType.BOOKING_REQUEST_SUBMITTED,
            "New booking request",
            actor.getEmail() + " requested a booking for " + resource.getName() + ".",
            "BOOKING",
            savedBooking.getId()
        );
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
    public List<BookingResponse> getBookingsByUserEmail(String userEmail) {
        return bookingRepository.findByCreatedByEmail(userEmail)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Booking not found with id: " + id));
        return convertToResponse(booking);
    }

    @Override
    public void deleteBooking(Long id, String actorEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Booking not found with id: " + id));

        User actor = ticketAuthorizationService.requireActor(actorEmail);
        if (actor.getRole() != UserRole.ADMIN && (booking.getCreatedBy() == null || !booking.getCreatedBy().equalsIgnoreCase(actor.getEmail()))) {
            throw new ForbiddenException("You are not allowed to cancel this booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        campusNotificationService.notifyEmail(
            booking.getCreatedBy(),
            booking.getCreatedByUser() != null ? booking.getCreatedByUser().getRole() : actor.getRole(),
            CampusNotificationType.BOOKING_CANCELLED,
            "Booking cancelled",
            "Your booking for " + booking.getResource().getName() + " was cancelled.",
            "BOOKING",
            booking.getId()
        );
        campusNotificationService.notifyRole(
            UserRole.ADMIN,
            actor.getEmail(),
            CampusNotificationType.BOOKING_CANCELLED,
            "Booking cancelled",
            "Booking #" + booking.getId() + " was cancelled by " + actor.getEmail() + ".",
            "BOOKING",
            booking.getId()
        );
    }

    @Override
    public BookingResponse approveBooking(Long id, String actorEmail) {
        User actor = ticketAuthorizationService.requireActor(actorEmail);
        if (actor.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("Only ADMIN can approve bookings");
        }

        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Booking not found with id: " + id));

        booking.setStatus(BookingStatus.APPROVED);
        booking.setRejectionReason(null);
        Booking saved = bookingRepository.save(booking);

        campusNotificationService.notifyEmail(
            booking.getCreatedBy(),
            booking.getCreatedByUser() != null ? booking.getCreatedByUser().getRole() : actor.getRole(),
            CampusNotificationType.BOOKING_APPROVED,
            "Booking approved",
            "Your booking for " + booking.getResource().getName() + " has been approved.",
            "BOOKING",
            booking.getId()
        );
        return convertToResponse(saved);
    }

    @Override
    public BookingResponse rejectBooking(Long id, BookingDecisionRequest request, String actorEmail) {
        User actor = ticketAuthorizationService.requireActor(actorEmail);
        if (actor.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("Only ADMIN can reject bookings");
        }

        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Booking not found with id: " + id));

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(request.getReason() == null ? null : request.getReason().trim());
        Booking saved = bookingRepository.save(booking);

        String reason = booking.getRejectionReason();
        campusNotificationService.notifyEmail(
            booking.getCreatedBy(),
            booking.getCreatedByUser() != null ? booking.getCreatedByUser().getRole() : actor.getRole(),
            CampusNotificationType.BOOKING_REJECTED,
            "Booking rejected",
            "Your booking for " + booking.getResource().getName() + " was rejected" + (reason == null || reason.isBlank() ? "." : ": " + reason),
            "BOOKING",
            booking.getId()
        );
        return convertToResponse(saved);
    }
}
