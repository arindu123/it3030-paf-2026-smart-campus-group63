# Member 3 Contribution: Incident Tickets + Attachments + Technician Updates

## Scope Delivered
- Incident ticket creation with validation and meaningful error responses.
- Image attachment handling with max 3 files per ticket, file type/size validation, and safe storage.
- Full workflow with enforced transitions:
  - `OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED`
  - `OPEN/IN_PROGRESS -> REJECTED` (admin only, reason required)
- Technician assignment and role-aware status/progress/resolution updates.
- Resolution notes and technician progress updates persisted per ticket.
- Comment system with ownership rules (owner/admin controls).
- User notifications for status changes and new comments on their tickets.
- React UI for end-to-end flow and role-aware controls.

## Backend Architecture
- `controller`:
  - `TicketController`
  - `AttachmentController`
  - `TicketCommentController`
  - `TicketNotificationController`
- `service`:
  - `TicketService`
  - `AttachmentService`
  - `TicketCommentService`
  - `TicketNotificationService`
  - `TicketAuthorizationService`
  - `TicketWorkflowRules`
- `repository`:
  - `TicketRepository`
  - `AttachmentRepository`
  - `TicketCommentRepository`
  - `TicketProgressUpdateRepository`
  - `TicketNotificationRepository`
- `entity/model`:
  - `Ticket`
  - `Attachment`
  - `TicketComment`
  - `TicketProgressUpdate`
  - `TicketNotification`
- `dto`:
  - request/response DTOs under `dto/ticket`
- `validation + exception handling`:
  - bean validation (`@Valid`, `jakarta.validation`)
  - `GlobalExceptionHandler` + custom exceptions

## Database Relationship Design
- `Ticket (1) -> (many) Attachment`
- `Ticket (1) -> (many) TicketComment`
- `Ticket (1) -> (many) TicketProgressUpdate`
- `Ticket (1) -> (many) TicketNotification`
- `Ticket (many) -> (1) User` as creator (`createdByUser`, optional FK)
- `Ticket (many) -> (1) User` as assigned technician (`assignedToUser`, optional FK)
- `Ticket (many) -> (1) Resource` as related resource reference (`resourceRef`, optional FK)

## Role Rules (X-User-Email based)
- `USER`
  - create tickets
  - view own tickets
  - add comments to own tickets
  - edit/delete own comments
- `TECHNICIAN`
  - can work on assigned tickets (status IN_PROGRESS/RESOLVED, resolution notes, progress updates, comments)
- `ADMIN`
  - assign technicians
  - close tickets
  - reject tickets with reason
  - manage all comments

## Key API Endpoints
- `POST /api/tickets` create ticket
- `GET /api/tickets` list visible tickets (optional `?status=...`)
- `GET /api/tickets/{id}` get ticket details
- `PATCH /api/tickets/{id}/status` workflow status update
- `PATCH /api/tickets/{id}/assign` assign technician (admin)
- `PATCH /api/tickets/{id}/resolution` save resolution note
- `PATCH /api/tickets/{id}/reject` reject with reason (admin)
- `POST /api/tickets/{id}/attachments` upload image attachments
- `GET /api/tickets/{id}/attachments` list attachment metadata
- `GET /api/tickets/attachments/{attachmentId}/file` retrieve attachment content
- `POST /api/tickets/{id}/comments` add comment
- `PATCH /api/tickets/comments/{commentId}` edit comment
- `DELETE /api/tickets/comments/{commentId}` delete comment
- `POST /api/tickets/{id}/progress-updates` add technician update
- `GET /api/tickets/notifications` get current user notifications

## Example JSON: Create Ticket
```json
{
  "title": "Projector in Lab 3 not working",
  "category": "EQUIPMENT",
  "description": "Projector is not turning on for the morning lecture.",
  "priority": "HIGH",
  "preferredContactDetails": "0771234567",
  "relatedResource": "Lab 3 Projector",
  "relatedLocation": "Engineering Building - Lab 3"
}
```

## Example JSON: Assign Technician
```json
{
  "technicianEmail": "tech1@sliit.lk"
}
```

## Example JSON: Reject Ticket
```json
{
  "reason": "Duplicate issue already tracked in Ticket #22"
}
```

## Example JSON: Error Response
```json
{
  "timestamp": "2026-04-17T15:05:22.051",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/tickets",
  "validationErrors": [
    "title: Title is required"
  ]
}
```

## Real-World Flow (Lab 3 Projector)
1. Student creates ticket with title/category/description/priority/contact/location.
2. Student uploads up to 3 evidence images.
3. Ticket starts in `OPEN`.
4. Admin assigns technician.
5. Assigned technician moves ticket to `IN_PROGRESS`.
6. Technician posts progress updates and comments.
7. Technician adds resolution note and sets status `RESOLVED`.
8. Admin verifies and sets `CLOSED`.
9. If invalid/duplicate, admin uses reject endpoint with reason -> `REJECTED`.
10. Student receives notifications for status changes and new comments.

## Frontend Workflow (React)
- Ticket page supports:
  - create incident ticket
  - upload up to 3 images
  - view ticket list + detail sections
  - add/edit/delete comments (role-aware)
  - assign technician (admin)
  - update status by role/workflow
  - add progress updates and resolution notes
- Notifications page:
  - shows ticket status/comment alerts
  - mark-as-read action

## Testing Evidence
- Unit test:
  - `TicketWorkflowRulesTest` (valid/invalid transitions)
- Controller integration-style test:
  - `TicketControllerWebMvcTest` (`MockMvc` with validation and create endpoint)
- Postman collection:
  - `postman/SmartCampus-Ticketing-Member3.postman_collection.json`

## Viva Summary (How to Explain Your Part)
- "I designed and implemented the complete maintenance ticketing lifecycle for Smart Campus."
- "My module covers ticket creation, image evidence, workflow enforcement, technician assignment, progress tracking, resolution notes, comment ownership, and user notifications."
- "I used layered Spring Boot architecture with DTO validation, central exception handling, and role-based rules."
- "I also built the React ticket workspace and notification feed to demonstrate end-to-end behavior for USER/TECHNICIAN/ADMIN roles."
