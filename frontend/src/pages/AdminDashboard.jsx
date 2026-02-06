import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token, logout, user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users'); // users, dashboard, settings

    const fetchUsers = async () => {
        try {
            const response = await axiosClient.get('/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [token]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
        try {
            await axiosClient.delete(`/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.filter(user => user.id !== id));
            alert("Xóa thành công!");
        } catch (error) {
            console.error("Failed to delete user", error);
            alert("Xóa thất bại!");
        }
    };

    const handleRoleChange = async (id, currentRole) => {
        let newRole = prompt("Nhập quyền mới (Admin, HotelManager, User):", currentRole);
        if (!newRole || newRole === currentRole) return;
        
        if (newRole.toUpperCase() === 'ADMIN') newRole = 'Admin';
        if (newRole.toUpperCase() === 'HOTEL_MANAGER') newRole = 'HotelManager';
        if (newRole.toUpperCase() === 'HOTEL MANAGER') newRole = 'HotelManager';
        if (newRole.toUpperCase() === 'USER') newRole = 'User';

        if (!['Admin', 'HotelManager', 'User'].includes(newRole)) {
            alert("Quyền không hợp lệ!");
            return;
        }

        try {
            const response = await axiosClient.put(`/admin/users/${id}/role`, null, {
                params: { role: newRole },
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.map(user => user.id === id ? response.data : user));
            alert("Cập nhật quyền thành công!");
        } catch (error) {
            console.error("Failed to update role", error);
            alert("Cập nhật quyền thất bại!");
        }
    };
    
    const handleStatusChange = async (id) => {
         try {
            const response = await axiosClient.put(`/admin/users/${id}/status`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });
             setUsers(users.map(user => user.id === id ? response.data : user));
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Cập nhật trạng thái thất bại!");
        }
    };

    // Stats Calculation
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.trangThai).length;
    const adminCount = users.filter(u => u.chucVu === 'Admin').length;

    if (loading) return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-blue-900 text-white flex flex-col shadow-xl z-20 hidden md:flex">
                <div className="h-16 flex items-center justify-center border-b border-blue-800">
                    <h2 className="text-2xl font-bold tracking-wider">ADMIN PANNEL</h2>
                </div>
                
                <div className="flex-1 py-6 px-4 space-y-2">
                     <button 
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full flex items-center px-4 py-3 rounded transition-colors ${activeTab === 'dashboard' ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800'}`}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                        Dashboard
                    </button>
                    <button 
                         onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center px-4 py-3 rounded transition-colors ${activeTab === 'users' ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800'}`}
                    >
                         <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        Người Dùng
                    </button>
                    <button 
                         onClick={() => setActiveTab('hotels')}
                        className={`w-full flex items-center px-4 py-3 rounded transition-colors ${activeTab === 'hotels' ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800'}`}
                    >
                         <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        Khách Sạn
                    </button>
                    <button 
                         onClick={() => setActiveTab('rooms')}
                        className={`w-full flex items-center px-4 py-3 rounded transition-colors ${activeTab === 'rooms' ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800'}`}
                    >
                         <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                        Phòng
                    </button>
                    <button 
                         onClick={() => setActiveTab('bookings')}
                        className={`w-full flex items-center px-4 py-3 rounded transition-colors ${activeTab === 'bookings' ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800'}`}
                    >
                         <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        Đặt Phòng
                    </button>
                    <button 
                         onClick={() => setActiveTab('reports')}
                        className={`w-full flex items-center px-4 py-3 rounded transition-colors ${activeTab === 'reports' ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800'}`}
                    >
                         <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                        Báo Cáo
                    </button>
                </div>

                <div className="p-4 border-t border-blue-800">
                     <button 
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-blue-200 hover:text-white hover:bg-blue-800 rounded transition-colors"
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        Đăng Xuất
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white shadow flex items-center justify-between px-8 z-10">
                    <div className="font-bold text-gray-700 text-lg md:hidden">Booking Khach San Admin</div>
                    <div className="hidden md:block text-gray-500">
                        Hôm nay: {new Date().toLocaleDateString('vi-VN')}
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <div className="text-sm font-bold text-gray-800">{currentUser?.hoTen || 'Administrator'}</div>
                            <div className="text-xs text-gray-500">Admin</div>
                        </div>
                        <img 
                            className="h-10 w-10 rounded-full border-2 border-blue-500 object-cover" 
                            src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" 
                            alt="Admin" 
                        />
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-800">Tổng Quan</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Tổng Người Dùng</p>
                                        <h3 className="text-3xl font-bold text-gray-800">{totalUsers}</h3>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                                         <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Đang Hoạt Động</p>
                                        <h3 className="text-3xl font-bold text-gray-800">{activeUsers}</h3>
                                    </div>
                                     <div className="p-3 bg-green-100 rounded-full text-green-600">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Quản Trị Viên</p>
                                        <h3 className="text-3xl font-bold text-gray-800">{adminCount}</h3>
                                    </div>
                                     <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                         <div className="mt-8 bg-white shadow-lg rounded-xl overflow-hidden">
                             <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                <h3 className="text-xl font-bold text-gray-800">Danh Sách Người Dùng</h3>
                                <button
                                    onClick={fetchUsers}
                                    className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition"
                                    title="Tải lại"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full leading-normal">
                                    <thead>
                                        <tr>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id} className="hover:bg-blue-50 transition duration-150">
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 w-10 h-10">
                                                            <img className="w-full h-full rounded-full border border-gray-200"
                                                                src={`https://ui-avatars.com/api/?name=${user.hoTen}&background=random`}
                                                                alt="" />
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-gray-900 font-semibold whitespace-no-wrap">{user.hoTen}</p>
                                                            <p className="text-gray-400 text-xs">ID: {user.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                                    <p className="text-gray-500 whitespace-no-wrap">{user.email}</p>
                                                </td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                                        ${user.chucVu === 'Admin' ? 'bg-red-100 text-red-800' : 
                                                          user.chucVu === 'HotelManager' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                                        {user.chucVu}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                                     <button 
                                                        onClick={() => handleStatusChange(user.id)}
                                                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none 
                                                            ${user.trangThai ? 'bg-green-500' : 'bg-gray-200'}`}
                                                    >
                                                        <span
                                                            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                                                user.trangThai ? 'translate-x-6' : 'translate-x-1'
                                                            }`}
                                                        />
                                                    </button>
                                                </td>
                                                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-right">
                                                    <div className="flex items-center justify-end space-x-3">
                                                         <button 
                                                            onClick={() => handleRoleChange(user.id, user.chucVu)}
                                                            className="text-blue-600 hover:text-blue-900 font-medium text-sm hover:underline"
                                                        >
                                                            Edit Role
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(user.id)}
                                                            className="text-red-500 hover:text-red-700 font-medium text-sm hover:underline"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {['hotels', 'rooms', 'bookings', 'reports'].includes(activeTab) && (
                        <div className="mt-8 bg-white shadow-lg rounded-xl p-12 text-center border border-gray-100">
                             <div className="inline-block p-4 rounded-full bg-blue-50 text-blue-500 mb-4">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                             </div>
                             <h3 className="text-2xl font-bold text-gray-800 mb-2">Chức Năng Đang Phát Triển</h3>
                             <p className="text-gray-500">Module quản lý {activeTab} sẽ sớm ra mắt trong bản cập nhật tới.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
