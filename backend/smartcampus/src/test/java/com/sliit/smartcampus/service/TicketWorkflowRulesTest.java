package com.sliit.smartcampus.service;

import com.sliit.smartcampus.enums.TicketStatus;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TicketWorkflowRulesTest {

    @Test
    void shouldAllowValidTransitions() {
        assertTrue(TicketWorkflowRules.canTransition(TicketStatus.OPEN, TicketStatus.IN_PROGRESS));
        assertTrue(TicketWorkflowRules.canTransition(TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED));
        assertTrue(TicketWorkflowRules.canTransition(TicketStatus.RESOLVED, TicketStatus.CLOSED));
        assertTrue(TicketWorkflowRules.canTransition(TicketStatus.OPEN, TicketStatus.REJECTED));
    }

    @Test
    void shouldRejectInvalidTransitions() {
        assertFalse(TicketWorkflowRules.canTransition(TicketStatus.OPEN, TicketStatus.CLOSED));
        assertFalse(TicketWorkflowRules.canTransition(TicketStatus.RESOLVED, TicketStatus.IN_PROGRESS));
        assertFalse(TicketWorkflowRules.canTransition(TicketStatus.REJECTED, TicketStatus.OPEN));
        assertFalse(TicketWorkflowRules.canTransition(TicketStatus.CLOSED, TicketStatus.RESOLVED));
    }
}
