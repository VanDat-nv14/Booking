import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        const storedRole = localStorage.getItem('role');
        const storedName = localStorage.getItem('hoTen');
        const storedUserId = localStorage.getItem('userId');
        const storedEmail = localStorage.getItem('email');
        const storedAvatar = localStorage.getItem('avatarUrl');
        if (storedRole && storedName) {
            setUser({
                role: storedRole,
                hoTen: storedName,
                userId: storedUserId,
                email: storedEmail,
                avatarUrl: storedAvatar || null,
            });
        }
        setLoading(false);
        // Fetch fresh avatar in background (non-blocking)
        // Chỉ cập nhật khi có giá trị mới; KHÔNG xóa avatarUrl khi backend trả rỗng (giữ avatar từ OAuth callback)
        if (storedUserId) {
            axiosClient.get(`/user/${storedUserId}`)
                .then(res => {
                    const freshAvatar = (res.data?.avatarUrl && res.data.avatarUrl.trim()) ? res.data.avatarUrl.trim() : null;
                    if (freshAvatar) {
                        localStorage.setItem('avatarUrl', freshAvatar);
                        setUser(prev => prev ? { ...prev, avatarUrl: freshAvatar } : prev);
                    }
                })
                .catch(() => {});
        }
    }, [token]);

    // Dang nhap: luu token va thong tin user vao state va localStorage
    const login = (newToken, role, hoTen, userId, email, avatarUrl) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('role', role);
        localStorage.setItem('hoTen', hoTen);
        localStorage.setItem('userId', String(userId));
        localStorage.setItem('email', email);
        if (avatarUrl) localStorage.setItem('avatarUrl', avatarUrl);
        setToken(newToken);
        setUser({ role, hoTen, userId: String(userId), email, avatarUrl: avatarUrl || null });
    };

    // Cap nhat avatar sau khi upload
    const updateAvatar = (url) => {
        if (url) localStorage.setItem('avatarUrl', url);
        else localStorage.removeItem('avatarUrl');
        setUser(prev => prev ? { ...prev, avatarUrl: url || null } : prev);
    };

    // Dang xuat: xoa TOAN BO du lieu phien
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('hoTen');
        localStorage.removeItem('userId');
        localStorage.removeItem('email');
        localStorage.removeItem('avatarUrl');
        setToken(null);
        setUser(null);
    };

    // Kiem tra xem user hien tai co quyen khong
    const hasRole = (role) => {
        if (!user) return false;
        if (Array.isArray(role)) return role.includes(user.role);
        return user.role === role;
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, hasRole, updateAvatar }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
