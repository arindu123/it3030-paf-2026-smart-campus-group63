package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.entity.Attachment;
import com.sliit.smartcampus.service.AttachmentService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping("/{ticketId}")
    public Attachment uploadFile(@PathVariable Long ticketId,
                                 @RequestParam("file") MultipartFile file) throws IOException {
        return attachmentService.uploadFile(ticketId, file);
    }

    @GetMapping("/{ticketId}")
    public List<Attachment> getAttachments(@PathVariable Long ticketId) {
        return attachmentService.getAttachmentsByTicketId(ticketId);
    }
}