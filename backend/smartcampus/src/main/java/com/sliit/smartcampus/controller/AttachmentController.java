package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.ticket.AttachmentResponse;
import com.sliit.smartcampus.entity.Attachment;
import com.sliit.smartcampus.service.AttachmentService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/tickets")
public class AttachmentController {

    private final AttachmentService attachmentService;
    private static final String ACTOR_HEADER = "X-User-Email";

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping("/{ticketId}/attachments")
    public ResponseEntity<List<AttachmentResponse>> uploadFiles(@PathVariable Long ticketId,
                                                                @RequestParam("files") MultipartFile[] files,
                                                                @RequestHeader(ACTOR_HEADER) String actorEmail) throws IOException {
        return ResponseEntity.status(201).body(attachmentService.uploadFiles(ticketId, files, actorEmail));
    }

    @GetMapping("/{ticketId}/attachments")
    public List<AttachmentResponse> getAttachments(@PathVariable Long ticketId,
                                                   @RequestHeader(ACTOR_HEADER) String actorEmail) {
        return attachmentService.getAttachmentsByTicketId(ticketId, actorEmail);
    }

    @GetMapping("/attachments/{attachmentId}/file")
    public ResponseEntity<Resource> getAttachmentFile(@PathVariable Long attachmentId,
                                                      @RequestHeader(ACTOR_HEADER) String actorEmail) throws IOException {
        Attachment attachment = attachmentService.getAttachmentById(attachmentId, actorEmail);
        Path path = Paths.get(attachment.getFilePath());

        if (!Files.exists(path)) {
            return ResponseEntity.notFound().build();
        }

        ByteArrayResource resource = new ByteArrayResource(Files.readAllBytes(path));
        MediaType mediaType;

        try {
            mediaType = attachment.getFileType() != null
                ? MediaType.parseMediaType(attachment.getFileType())
                : MediaType.APPLICATION_OCTET_STREAM;
        } catch (Exception ex) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
            .contentType(mediaType)
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + attachment.getFileName() + "\"")
            .body(resource);
    }

    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long attachmentId,
                                                 @RequestHeader(ACTOR_HEADER) String actorEmail) throws IOException {
        attachmentService.deleteAttachment(attachmentId, actorEmail);
        return ResponseEntity.noContent().build();
    }
}
