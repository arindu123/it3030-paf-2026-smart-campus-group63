package com.sliit.smartcampus.service;

import com.sliit.smartcampus.enums.TicketStatus;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

public final class TicketWorkflowRules {

    private static final Map<TicketStatus, Set<TicketStatus>> ALLOWED_TRANSITIONS = new EnumMap<>(TicketStatus.class);

    static {
        ALLOWED_TRANSITIONS.put(TicketStatus.OPEN, EnumSet.of(TicketStatus.IN_PROGRESS, TicketStatus.REJECTED));
        ALLOWED_TRANSITIONS.put(TicketStatus.IN_PROGRESS, EnumSet.of(TicketStatus.RESOLVED, TicketStatus.REJECTED));
        ALLOWED_TRANSITIONS.put(TicketStatus.RESOLVED, EnumSet.of(TicketStatus.CLOSED));
        ALLOWED_TRANSITIONS.put(TicketStatus.CLOSED, EnumSet.noneOf(TicketStatus.class));
        ALLOWED_TRANSITIONS.put(TicketStatus.REJECTED, EnumSet.noneOf(TicketStatus.class));
    }

    private TicketWorkflowRules() {
    }

    public static boolean canTransition(TicketStatus from, TicketStatus to) {
        if (from == null || to == null) {
            return false;
        }

        Set<TicketStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(from, EnumSet.noneOf(TicketStatus.class));
        return allowed.contains(to);
    }
}
