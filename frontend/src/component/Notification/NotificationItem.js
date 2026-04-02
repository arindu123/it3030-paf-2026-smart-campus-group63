import React from "react";
import api from "../../api";

function NotificationItem({ notification, onRead }) {

    const handleClick = async () => {
        if (!notification.isRead) {
            try {
                await api.put(`/notifications/${notification.id}/read`);
                onRead(notification.id);
            } catch (error) {
                console.error("Mark read failed:", error);
            }
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case "BOOKING_APPROVED":   return "#22c55e";
            case "BOOKING_REJECTED":   return "#ef4444";
            case "TICKET_STATUS_CHANGED": return "#f59e0b";
            case "NEW_COMMENT":        return "#3b82f6";
            case "TICKET_ASSIGNED":    return "#8b5cf6";
            default:                   return "#6b7280";
        }
    };

    return (
        <div
            onClick={handleClick}
            style={{
                ...styles.item,
                backgroundColor: notification.isRead ? "#fff" : "#f0f7ff"
            }}
        >
            <div
                style={{
                    ...styles.dot,
                    backgroundColor: getTypeColor(notification.type)
                }}
            />
            <div style={styles.content}>
                <p style={styles.title}>{notification.title}</p>
                <p style={styles.message}>{notification.message}</p>
                <p style={styles.time}>
                    {new Date(notification.createdAt).toLocaleString()}
                </p>
            </div>
            {!notification.isRead && <div style={styles.unreadBadge} />}
        </div>
    );
}

const styles = {
    item: {
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        padding: "12px 14px",
        borderBottom: "1px solid #f0f0f0",
        cursor: "pointer",
        transition: "background 0.15s"
    },
    dot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        marginTop: "5px",
        flexShrink: 0
    },
    content: {
        flex: 1
    },
    title: {
        fontSize: "13px",
        fontWeight: "600",
        color: "#1a1a1a",
        margin: "0 0 2px 0"
    },
    message: {
        fontSize: "12px",
        color: "#555",
        margin: "0 0 4px 0"
    },
    time: {
        fontSize: "11px",
        color: "#aaa",
        margin: 0
    },
    unreadBadge: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: "#3b82f6",
        flexShrink: 0,
        marginTop: "5px"
    }
};

export default NotificationItem;
