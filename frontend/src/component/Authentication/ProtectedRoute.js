import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
    const { token, user, loading } = useAuth();

    // Token check වෙනකල් wait කරනවා
    if (loading) {
        return (
            <div style={styles.container}>
                <p>Loading...</p>
            </div>
        );
    }

    // Login නැත්නම් login ට යවනවා
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Role check — allowedRoles pass කරලා තියෙනවා නම්
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh"
    }
};

export default ProtectedRoute;
