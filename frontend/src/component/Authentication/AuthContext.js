import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(
        sessionStorage.getItem("sc_token")
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchCurrentUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchCurrentUser = async () => {
        try {
            const res = await api.get("/auth/users");
            setUser(res.data);
        } catch (error) {
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = (newToken) => {
        sessionStorage.setItem("sc_token", newToken);
        setToken(newToken);
    };

    const logout = () => {
        sessionStorage.removeItem("sc_token");
        setToken(null);
        setUser(null);
    };

    const isAdmin = () => user?.role === "ADMIN";
    const isTechnician = () => user?.role === "TECHNICIAN";
    const isUser = () => user?.role === "USER";

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            logout,
            isAdmin,
            isTechnician,
            isUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
