import React, { useState, useEffect } from "react";
import api from "../../api";
import { useAuth } from "../Authentication/AuthContext";
import NotificationItem from "./NotificationItem";

function NotificationList() {
    const { user } = useAuth();
    const [items, setItems]     = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchNotifications();
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get(`/notifications/user/${user.id}`);
            setItems(res.data);
        } catch (error) {
            console.error("Fetch failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put(`/notifications/user/${user.id}/read-all`);
            setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Mark all read failed:", error);
        }
    };

    const handleItemRead = (id) => {
        setItems((prev) =>
            prev.map((n) => n.id === id ? { ...n, isRead: true } : n)
        );
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setItems((prev) => prev.filter((n) => n.id !== id));
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    if (loading) return <p style={styles.center}>Loading...</p>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Notifications</h2>
                {items.length > 0 && (
                    <button
                        style={styles.markAllBtn}
                        onClick={handleMarkAllRead}
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {items.length === 0 ? (
                <p style={styles.empty}>No notifications yet</p>
            ) : (
                <div style={styles.list}>
                    {items.map((n) => (
                        <div key={n.id} style={styles.row}>
                            <NotificationItem
                                notification={n}
                                onRead={handleItemRead}
                            />
                            <button
                                style={styles.deleteBtn}
                                onClick={() => handleDelete(n.id)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: "640px",
        margin: "40px auto",
        padding: "0 16px"
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px"
    },
    title: {
        fontSize: "20px",
        fontWeight: "600",
        color: "#1a1a1a",
        margin: 0
    },
    markAllBtn: {
        background: "none",
        border: "1px solid #3b82f6",
        color: "#3b82f6",
        padding: "6px 12px",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "13px"
    },
    list: {
        backgroundColor: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        overflow: "hidden"
    },
    row: {
        display: "flex",
        alignItems: "center"
    },
    deleteBtn: {
        background: "none",
        border: "none",
        color: "#ccc",
        cursor: "pointer",
        padding: "0 12px",
        fontSize: "14px",
        flexShrink: 0
    },
    empty: {
        textAlign: "center",
        color: "#999",
        fontSize: "14px",
        padding: "48px 0"
    },
    center: {
        textAlign: "center",
        color: "#999",
        marginTop: "40px"
    }
};

export default NotificationList;
