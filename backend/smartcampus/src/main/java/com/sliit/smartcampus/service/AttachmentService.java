package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.ticket.AttachmentResponse;
import com.sliit.smartcampus.entity.Attachment;
import com.sliit.smartcampus.entity.Ticket;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.exception.BadRequestException;
import com.sliit.smartcampus.exception.NotFoundException;
import com.sliit.smartcampus.repository.AttachmentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class AttachmentService {

    private static final Pattern SAFE_FILE_CHARS = Pattern.compile("[^a-zA-Z0-9._-]");

    private final AttachmentRepository attachmentRepository;
    private final TicketService ticketService;
    private final TicketAuthorizationService ticketAuthorizationService;
    private final Path attachmentRoot;
    private final int maxAttachmentsPerTicket;
    private final long maxAttachmentSizeBytes;
    private final Set<String> allowedTypes;

    public AttachmentService(AttachmentRepository attachmentRepository,
                             TicketService ticketService,
                             TicketAuthorizationService ticketAuthorizationService,
                             @Value("${app.ticket.attachments.dir:uploads/ticket-attachments}") String attachmentDirectory,
                             @Value("${app.ticket.attachments.max-per-ticket:3}") int maxAttachmentsPerTicket,
                             @Value("${app.ticket.attachments.max-size-bytes:5242880}") long maxAttachmentSizeBytes,
                             @Value("${app.ticket.attachments.allowed-types:image/jpeg,image/png,image/webp,image/gif}") String allowedTypesCsv) {
        this.attachmentRepository = attachmentRepository;
        this.ticketService = ticketService;
        this.ticketAuthorizationService = ticketAuthorizationService;
        this.attachmentRoot = Paths.get(attachmentDirectory).toAbsolutePath().normalize();
        this.maxAttachmentsPerTicket = maxAttachmentsPerTicket;
        this.maxAttachmentSizeBytes = maxAttachmentSizeBytes;
        this.allowedTypes = parseAllowedTypes(allowedTypesCsv);
    }

    public List<AttachmentResponse> uploadFiles(Long ticketId,
                                                MultipartFile[] files,
                                                String actorEmail) throws IOException {
        User actor = ticketAuthorizationService.requireActor(actorEmail);
        Ticket ticket = ticketService.getTicketEntityForActor(ticketId, actor);
        ticketAuthorizationService.assertCanUploadAttachment(actor, ticket);

        if (files == null || files.length == 0) {
            throw new BadRequestException("At least one attachment file is required");
        }

        long existingCount = attachmentRepository.countByTicketId(ticketId);
        if (existingCount + files.length > maxAttachmentsPerTicket) {
            throw new BadRequestException(
                "Ticket can have up to " + maxAttachmentsPerTicket + " attachments. Existing: " + existingCount
            );
        }

        createAttachmentDirectoryIfMissing();

        for (MultipartFile file : files) {
            validateAttachment(file);
        }

        return List.of(files).stream()
            .map(file -> saveSingleAttachment(ticket, file))
            .map(this::toResponse)
            .toList();
    }

    public List<AttachmentResponse> getAttachmentsByTicketId(Long ticketId, String actorEmail) {
        User actor = ticketAuthorizationService.requireActor(actorEmail);
        Ticket ticket = ticketService.getTicketEntityForActor(ticketId, actor);
        ticketAuthorizationService.assertCanViewTicket(actor, ticket);

        return attachmentRepository.findByTicketIdOrderByUploadedAtAsc(ticketId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    public Attachment getAttachmentById(Long attachmentId, String actorEmail) {
        User actor = ticketAuthorizationService.requireActor(actorEmail);
        return attachmentRepository.findById(attachmentId)
            .map(attachment -> {
                ticketAuthorizationService.assertCanViewTicket(actor, attachment.getTicket());
                return attachment;
            })
            .orElseThrow(() -> new NotFoundException("Attachment not found with id: " + attachmentId));
    }

    public void deleteAttachment(Long attachmentId, String actorEmail) throws IOException {
        User actor = ticketAuthorizationService.requireActor(actorEmail);
        Attachment attachment = attachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new NotFoundException("Attachment not found with id: " + attachmentId));

        ticketAuthorizationService.assertCanUploadAttachment(actor, attachment.getTicket());

        Path filePath = Paths.get(attachment.getFilePath()).toAbsolutePath().normalize();
        attachmentRepository.delete(attachment);

        if (Files.exists(filePath) && filePath.startsWith(attachmentRoot)) {
            Files.delete(filePath);
        }
    }

    private Attachment saveSingleAttachment(Ticket ticket, MultipartFile file) {
        try {
            String originalFileName = file.getOriginalFilename() == null ? "file" : file.getOriginalFilename();
            String safeOriginalName = SAFE_FILE_CHARS.matcher(originalFileName).replaceAll("_");
            String storedFileName = UUID.randomUUID() + "_" + safeOriginalName;
            Path targetPath = attachmentRoot.resolve(storedFileName).normalize();

            if (!targetPath.startsWith(attachmentRoot)) {
                throw new BadRequestException("Invalid file path detected");
            }

            file.transferTo(targetPath.toFile());

            Attachment attachment = new Attachment();
            attachment.setTicket(ticket);
            attachment.setFileName(originalFileName);
            attachment.setStoredFileName(storedFileName);
            attachment.setFileType(file.getContentType());
            attachment.setFilePath(targetPath.toString());
            attachment.setFileSize(file.getSize());
            attachment.setUploadedAt(LocalDateTime.now());
            return attachmentRepository.save(attachment);
        } catch (IOException ex) {
            throw new BadRequestException("Failed to store file: " + ex.getMessage());
        }
    }

    private void validateAttachment(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Empty attachment file is not allowed");
        }

        if (file.getSize() > maxAttachmentSizeBytes) {
            throw new BadRequestException(
                "Attachment exceeds max size " + maxAttachmentSizeBytes + " bytes: " + file.getOriginalFilename()
            );
        }

        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new BadRequestException(
                "Unsupported file type for attachment: " + file.getOriginalFilename()
            );
        }
    }

    private void createAttachmentDirectoryIfMissing() throws IOException {
        if (!Files.exists(attachmentRoot)) {
            Files.createDirectories(attachmentRoot);
        }
    }

    private Set<String> parseAllowedTypes(String csv) {
        Set<String> values = new HashSet<>();
        if (csv == null || csv.isBlank()) {
            return values;
        }

        for (String value : csv.split(",")) {
            String normalized = value.trim().toLowerCase(Locale.ROOT);
            if (!normalized.isBlank()) {
                values.add(normalized);
            }
        }
        return values;
    }

    private AttachmentResponse toResponse(Attachment attachment) {
        AttachmentResponse response = new AttachmentResponse();
        response.setId(attachment.getId());
        response.setFileName(attachment.getFileName());
        response.setFileType(attachment.getFileType());
        response.setFileSize(attachment.getFileSize());
        response.setUploadedAt(attachment.getUploadedAt());
        response.setDownloadUrl("/api/tickets/attachments/" + attachment.getId() + "/file");
        return response;
    }
}
