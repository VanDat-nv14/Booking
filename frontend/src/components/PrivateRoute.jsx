import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute: bao ve cac route can dang nhap va kiem tra quyen.
 * - Chua dang nhap → chuyen ve /login (luu lai trang hien tai)
 * - Da dang nhap nhung khong du quyen → hien trang 403
 * - Du quyen → render noi dung (Outlet)
 */
const PrivateRoute = ({ allowedRoles }) => {
    const { token, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Đang tải...</p>
                </div>
            </div>
        );
    }

    // Chua dang nhap
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Da dang nhap nhung khong du quyen
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md mx-auto px-6">
                    <div className="text-8xl font-bold text-red-500 mb-4">403</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Truy Cập Bị Từ Chối</h1>
                    <p className="text-gray-500 mb-6">
                        Bạn không có quyền truy cập vào trang này.
                        {user?.role && (
                            <span> Vai trò hiện tại của bạn là <strong className="text-blue-600">{user.role}</strong>.</span>
                        )}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => window.history.back()}
                            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            ← Quay lại
                        </button>
                        <a
                            href="/"
                            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Trang Chủ
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return <Outlet />;
};

export default PrivateRoute;
