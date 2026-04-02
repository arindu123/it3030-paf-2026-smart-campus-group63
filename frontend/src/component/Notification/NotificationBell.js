import React, { useState, useEffect, useRef } from "react";
import api from "../../api";
import { useAuth } from "../Authentication/AuthContext";
import NotificationItem from "./NotificationItem";

function NotificationBell() {
    const { user } = useAuth();
    const [count, setCount]       = useState(0);
    const [items, setItems]       = useState([]);
    const [open, setOpen]         = useState(false);
    const [loading, setLoading]   = useState(false);
    const dropdownRef             = useRef(null);

    // Unread count — 30 seconds interval
    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Dropdown outside click close
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current &&
                !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get(
                `/notifications/user/${user.id}/unread-count`
            );
            setCount(res.data);
        } catch (error) {
            console.error("Unread count fetch failed:", error);
        }
    };

    const handleOpen = async () => {
        setOpen(!open);
        if (!open && user) {
            setLoading(true);
            try {
                const res = await api.get(
                    `/notifications/user/${user.id}`
                );
                setItems(res.data);
            } catch (error) {
                console.error("Notifications fetch failed:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put(
                `/notifications/user/${user.id}/read-all`
            );
            setCount(0);
            setItems((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
            );
        } catch (error) {
            console.error("Mark all read failed:", error);
        }
    };

    const handleItemRead = (id) => {
        setItems((prev) =>
            prev.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
            )
        );
        setCount((prev) => Math.max(0, prev - 1));
    };

    return (
        <div style={styles.wrapper} ref={dropdownRef}>

            {/* Bell Button */}
            <button style={styles.bellBtn} onClick={handleOpen}>
                🔔
                {count > 0 && (
                    <span style={styles.badge}>
                        {count > 99 ? "99+" : count}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div style={styles.dropdown}>
                    <div style={styles.header}>
                        <span style={styles.headerTitle}>Notifications</span>
                        {count > 0 && (
                            <button
                                style={styles.markAllBtn}
                                onClick={handleMarkAllRead}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div style={styles.list}>
                        {loading ? (
                            <p style={styles.empty}>Loading...</p>
                        ) : items.length === 0 ? (
                            <p style={styles.empty}>No notifications</p>
                        ) : (
                            items.map((n) => (
                                <NotificationItem
                                    key={n.id}
                                    notification={n}
                                    onRead={handleItemRead}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    wrapper: {
        position: "relative",
        display: "inline-block"
    },
    bellBtn: {
        position: "relative",
        background: "none",
        border: "none",
        fontSize: "20px",
        cursor: "pointer",
        padding: "6px"
    },
    badge: {
        position: "absolute",
        top: "0px",
        right: "0px",
        backgroundColor: "#ef4444",
        color: "#fff",
        fontSize: "10px",
        fontWeight: "600",
        padding: "1px 5px",
        borderRadius: "10px",
        minWidth: "16px",
        textAlign: "center"
    },
    dropdown: {
        position: "absolute",
        right: 0,
        top: "36px",
        width: "320px",
        backgroundColor: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        zIndex: 1000
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 14px",
        borderBottom: "1px solid #f0f0f0"
    },
    headerTitle: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#1a1a1a"
    },
    markAllBtn: {
        background: "none",
        border: "none",
        fontSize: "12px",
        color: "#3b82f6",
        cursor: "pointer"
    },
    list: {
        maxHeight: "360px",
        overflowY: "auto"
    },
    empty: {
        textAlign: "center",
        color: "#999",
        fontSize: "13px",
        padding: "24px"
    }
};

export default NotificationBell;
