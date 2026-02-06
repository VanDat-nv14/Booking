import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ allowedRoles }) => {
    const { token, user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div>Loading...</div>;

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        // User is logged in but doesn't have permission
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
