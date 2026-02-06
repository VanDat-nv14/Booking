import React, { useState, useEffect } from 'react';
import { CheckOutlined, CloseOutlined, UserOutlined, ToolOutlined, LoadingOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import staffService from '../../services/staffService';
import serviceService from '../../services/serviceService';

const Button = ({ children, onClick, className, disabled, type = "button" }) => (
  <button 
    type={type}
    onClick={onClick} 
    className={`btn ${className}`} 
    disabled={disabled}
  >
    {children}
  </button>
);

const Select = ({ value, onChange, children, className, placeholder }) => (
  <select 
    value={value} 
    onChange={onChange} 
    className={`form-control ${className}`}
  >
    <option value="" disabled>{placeholder}</option>
    {children}
  </select>
);

const Card = ({ title, children, className }) => (
  <div className={`card ${className}`}>
    <div className="card-header">
      <h5 className="card-title">{title}</h5>
    </div>
    <div className="card-body">
      {children}
    </div>
  </div>
);

const Toast = ({ show, message, type, onClose }) => {
  if (!show) return null;

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <span>{message}</span>
        <button onClick={onClose} className="toast-close">×</button>
      </div>
    </div>
  );
};

const StaffServiceAssignment = () => {
  const [staffList, setStaffList] = useState([]);
  const [serviceList, setServiceList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [loading, setLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Fetch staff list
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const staff = await staffService.getAllStaff();
      console.log('Staff data:', staff);
      setStaffList(staff || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      showToast('Lỗi khi lấy danh sách nhân viên', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch services list
  const fetchServices = async () => {
    try {
      const services = await serviceService.getAllServices();
      console.log('Services data:', services);
      setServiceList(services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      showToast('Lỗi khi lấy danh sách dịch vụ', 'error');
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchServices();
  }, []);

  // Get selected staff data
  const getSelectedStaffData = () => {
    return staffList.find(staff => staff.staffId?.toString() === selectedStaff);
  };

  // Check if staff has a service
  const hasService = (serviceId) => {
    const staffData = getSelectedStaffData();
    if (!staffData || !staffData.services) return false;
    return staffData.services.some(service => service.serviceId === serviceId);
  };

  // Assign service to staff
  const assignService = async (serviceId) => {
    if (!selectedStaff) {
      showToast('Vui lòng chọn nhân viên', 'error');
      return;
    }

    try {
      setAssignLoading(prev => ({ ...prev, [serviceId]: true }));
      console.log(`Assigning service ${serviceId} to staff ${selectedStaff}`);
      
      await staffService.assignServiceToStaff(selectedStaff, serviceId);
      showToast('Gán dịch vụ thành công!', 'success');
      
      // Refresh staff data
      await fetchStaff();
    } catch (error) {
      console.error('Error assigning service:', error);
      showToast('Lỗi khi gán dịch vụ cho nhân viên', 'error');
    } finally {
      setAssignLoading(prev => ({ ...prev, [serviceId]: false }));
    }
  };

  // Remove service from staff
  const removeService = async (serviceId) => {
    if (!selectedStaff) {
      showToast('Vui lòng chọn nhân viên', 'error');
      return;
    }

    try {
      setAssignLoading(prev => ({ ...prev, [serviceId]: true }));
      console.log(`Removing service ${serviceId} from staff ${selectedStaff}`);
      
      await staffService.removeServiceFromStaff(selectedStaff, serviceId);
      showToast('Bỏ gán dịch vụ thành công!', 'success');
      
      // Refresh staff data
      await fetchStaff();
    } catch (error) {
      console.error('Error removing service:', error);
      showToast('Lỗi khi bỏ gán dịch vụ khỏi nhân viên', 'error');
    } finally {
      setAssignLoading(prev => ({ ...prev, [serviceId]: false }));
    }
  };

  // Group services by category
  const groupedServices = serviceList.reduce((acc, service) => {
    const category = service.category || 'Khác';
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {});

  const selectedStaffData = getSelectedStaffData();

  return (
    <div className="staff-service-assignment">
      <style jsx>{`
        .staff-service-assignment {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .assignment-header {
          background: linear-gradient(135deg, #304FFE 0%, #304FFE 100%);
          color: white;
          padding: 30px;
          border-radius: 15px;
          margin-bottom: 30px;
          text-align: center;
        }

        .assignment-header h1 {
          margin: 0;
          font-size: 2rem;
          font-weight: 600;
        }

        .assignment-header p {
          margin: 10px 0 0 0;
          opacity: 0.9;
        }

        .staff-selector {
          margin-bottom: 30px;
        }

        .staff-selector label {
          display: block;
          margin-bottom: 10px;
          font-weight: 600;
          color: #333;
        }

        .form-control {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s ease;
        }

        .form-control:focus {
          outline: none;
          border-color: #304FFE;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .staff-info {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 30px;
          border-left: 4px solid #304FFE;
        }

        .staff-info h3 {
          margin: 0 0 10px 0;
          color: #333;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .staff-info p {
          margin: 5px 0;
          color: #666;
        }

        .current-services {
          margin-top: 15px;
        }

        .service-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }

        .service-tag {
          background: #304FFE;
          color: white;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
        }

        .services-grid {
          display: grid;
          gap: 25px;
        }

        .category-section {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .category-header {
          background: #304FFE;
          color: white;
          padding: 15px 20px;
          font-weight: 600;
          font-size: 18px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .category-services {
          padding: 20px;
        }

        .service-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
        }

        .service-item {
          border: 2px solid #e1e5e9;
          border-radius: 10px;
          padding: 15px;
          transition: all 0.3s ease;
          position: relative;
        }

        .service-item:hover {
          border-color: #304FFE;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
        }

        .service-item.assigned {
          border-color: #28a745;
          background: #f8fff9;
        }

        .service-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .service-name {
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .service-details {
          font-size: 14px;
          color: #666;
          margin: 5px 0;
        }

        .service-price {
          font-weight: 600;
          color: #304FFE;
          font-size: 16px;
        }

        .service-actions {
          margin-top: 15px;
          display: flex;
          gap: 10px;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.3s ease;
          flex: 1;
          justify-content: center;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn.primary {
          background: #28a745;
          color: white;
        }

        .btn.primary:hover:not(:disabled) {
          background: #218838;
        }

        .btn.danger {
          background: #dc3545;
          color: white;
        }

        .btn.danger:hover:not(:disabled) {
          background: #c82333;
        }

        .loading-state {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .no-selection {
          text-align: center;
          padding: 40px;
          color: #666;
          background: #f8f9fa;
          border-radius: 12px;
          border: 2px dashed #dee2e6;
        }

        .toast {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          padding: 15px 20px;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          max-width: 400px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .toast-success {
          background: #28a745;
        }

        .toast-error {
          background: #dc3545;
        }

        .toast-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .toast-close {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          margin-left: 10px;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .status-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-assigned {
          background: #d4edda;
          color: #155724;
        }

        .status-available {
          background: #e2e3e5;
          color: #383d41;
        }
      `}</style>

      <div className="assignment-header">
        <h1>
          <ToolOutlined /> Gán Dịch Vụ Cho Nhân Viên
        </h1>
        <p>Quản lý việc gán dịch vụ cho từng nhân viên</p>
      </div>

      <div className="staff-selector">
        <label htmlFor="staff-select">
          <UserOutlined /> Chọn nhân viên:
        </label>
        <Select
          id="staff-select"
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
          placeholder="-- Chọn nhân viên --"
        >
          {staffList.map(staff => (
            <option key={staff.staffId} value={staff.staffId}>
              {staff.fullName} - {staff.specialization}
            </option>
          ))}
        </Select>
      </div>

      {selectedStaffData && (
        <div className="staff-info">
          <h3>
            <UserOutlined />
            Thông tin nhân viên: {selectedStaffData.fullName}
          </h3>
          <p><strong>Email:</strong> {selectedStaffData.email}</p>
          <p><strong>Chuyên môn:</strong> {selectedStaffData.specialization}</p>
          <p><strong>Kinh nghiệm:</strong> {selectedStaffData.experience || 0} năm</p>
          
          <div className="current-services">
            <strong>Dịch vụ hiện tại:</strong>
            <div className="service-tags">
              {selectedStaffData.services?.length > 0 ? (
                selectedStaffData.services.map(service => (
                  <span key={service.serviceId} className="service-tag">
                    {service.name}
                  </span>
                ))
              ) : (
                <span style={{ color: '#666', fontStyle: 'italic' }}>
                  Chưa có dịch vụ nào được gán
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <LoadingOutlined style={{ fontSize: '24px' }} />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : !selectedStaff ? (
        <div className="no-selection">
          <UserOutlined style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.5 }} />
          <h3>Chưa chọn nhân viên</h3>
          <p>Vui lòng chọn nhân viên để xem và quản lý dịch vụ</p>
        </div>
      ) : (
        <div className="services-grid">
          {Object.keys(groupedServices).length === 0 ? (
            <div className="empty-state">
              <p>Không có dịch vụ nào</p>
            </div>
          ) : (
            Object.entries(groupedServices).map(([category, services]) => (
              <div key={category} className="category-section">
                <div className="category-header">
                  <ToolOutlined />
                  {category}
                </div>
                <div className="category-services">
                  <div className="service-grid">
                    {services.map(service => {
                      const isAssigned = hasService(service.serviceId);
                      const isLoading = assignLoading[service.serviceId];
                      
                      return (
                        <div 
                          key={service.serviceId} 
                          className={`service-item ${isAssigned ? 'assigned' : ''}`}
                        >
                          <div className={`status-badge ${isAssigned ? 'status-assigned' : 'status-available'}`}>
                            {isAssigned ? 'Đã gán' : 'Chưa gán'}
                          </div>
                          
                          <div className="service-header">
                            <h4 className="service-name">{service.name}</h4>
                          </div>
                          
                          <div className="service-details">
                            <p>Thời gian: {service.duration} phút</p>
                            <p className="service-price">
                              Giá: {service.price?.toLocaleString('vi-VN')} VND
                            </p>
                          </div>
                          
                          <div className="service-actions">
                            {isAssigned ? (
                              <Button
                                className="danger"
                                onClick={() => removeService(service.serviceId)}
                                disabled={isLoading}
                              >
                                {isLoading ? <LoadingOutlined /> : <MinusOutlined />}
                                {isLoading ? 'Đang bỏ gán...' : 'Bỏ gán'}
                              </Button>
                            ) : (
                              <Button
                                className="primary"
                                onClick={() => assignService(service.serviceId)}
                                disabled={isLoading}
                              >
                                {isLoading ? <LoadingOutlined /> : <PlusOutlined />}
                                {isLoading ? 'Đang gán...' : 'Gán dịch vụ'}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: '' })}
      />
    </div>
  );
};

export default StaffServiceAssignment; 
