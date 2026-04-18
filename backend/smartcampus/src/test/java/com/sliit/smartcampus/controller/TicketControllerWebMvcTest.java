package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.ticket.TicketCreateRequest;
import com.sliit.smartcampus.dto.ticket.TicketResponse;
import com.sliit.smartcampus.enums.TicketCategory;
import com.sliit.smartcampus.enums.TicketPriority;
import com.sliit.smartcampus.enums.TicketStatus;
import com.sliit.smartcampus.exception.GlobalExceptionHandler;
import com.sliit.smartcampus.service.TicketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.http.MediaType;

import java.time.LocalDateTime;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TicketControllerWebMvcTest {

    private MockMvc mockMvc;

    private TicketService ticketService;

    @BeforeEach
    void setUp() {
        ticketService = mock(TicketService.class);
        TicketController controller = new TicketController(ticketService);

        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
            .setControllerAdvice(new GlobalExceptionHandler())
            .setValidator(validator)
            .build();
    }

    @Test
    void createTicketShouldReturnCreatedWhenRequestIsValid() throws Exception {
        TicketCreateRequest request = new TicketCreateRequest();
        request.setTitle("Projector in Lab 3 not working");
        request.setCategory(TicketCategory.EQUIPMENT);
        request.setDescription("Projector is not turning on during lecture.");
        request.setPriority(TicketPriority.HIGH);
        request.setPreferredContactDetails("student@sliit.lk");
        request.setRelatedResource("Lab 3 Projector");
        request.setRelatedLocation("Lab 3");

        TicketResponse response = new TicketResponse();
        response.setId(1L);
        response.setTitle(request.getTitle());
        response.setCategory(request.getCategory());
        response.setDescription(request.getDescription());
        response.setPriority(request.getPriority());
        response.setPreferredContactDetails(request.getPreferredContactDetails());
        response.setRelatedResource(request.getRelatedResource());
        response.setRelatedLocation(request.getRelatedLocation());
        response.setCreatedBy("student@sliit.lk");
        response.setCreatedAt(LocalDateTime.now());
        response.setStatus(TicketStatus.OPEN);

        when(ticketService.createTicket(ArgumentMatchers.any(TicketCreateRequest.class), ArgumentMatchers.eq("student@sliit.lk")))
            .thenReturn(response);

        mockMvc.perform(post("/api/tickets")
                .header("X-User-Email", "student@sliit.lk")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "title": "Projector in Lab 3 not working",
                      "category": "EQUIPMENT",
                      "description": "Projector is not turning on during lecture.",
                      "priority": "HIGH",
                      "preferredContactDetails": "student@sliit.lk",
                      "relatedResource": "Lab 3 Projector",
                      "relatedLocation": "Lab 3"
                    }
                    """))
            .andExpect(status().isCreated());
    }

    @Test
    void createTicketShouldReturnBadRequestWhenTitleMissing() throws Exception {
        mockMvc.perform(post("/api/tickets")
                .header("X-User-Email", "student@sliit.lk")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "category": "EQUIPMENT",
                      "description": "Description present",
                      "priority": "HIGH",
                      "preferredContactDetails": "student@sliit.lk",
                      "relatedLocation": "Lab 3"
                    }
                    """))
            .andExpect(status().isBadRequest());
    }
}
