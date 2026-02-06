import React from 'react';
import {
  Typography,
  Radio,
  Collapse,
  List,
  Alert
} from 'antd';
import {
  DollarOutlined,
  BankOutlined,
  WalletOutlined,
  RightOutlined
} from '@ant-design/icons';
import './PaymentMethodSelector.css';

const { Text } = Typography;
const { Panel } = Collapse;

const PaymentMethodSelector = ({ value, onChange, paymentMethod, setPaymentMethod, className }) => {
  // Hỗ trợ cả 2 cách sử dụng: từ Antd Form (value/onChange) và props trực tiếp
  const currentValue = value || paymentMethod || 'COD';
  const handleChange = onChange || setPaymentMethod || (() => {});

  return (
    <div className={`payment-method-selector ${className || ''}`}>
      <Radio.Group 
        onChange={(e) => handleChange(e.target.value)}
        value={currentValue}
        className="payment-radio-group"
        style={{ width: '100%' }}
      >
        <div className="payment-option" style={{ marginBottom: 16 }}>
          <Radio value="COD" className="payment-radio">
            <div className="payment-option-content">
              <div className="payment-option-title">
                <DollarOutlined className="payment-icon cod-icon" style={{ color: '#52c41a', marginRight: 8 }} />
                <Text strong>Thanh toán khi nhận hàng (COD)</Text>
              </div>
              <Text type="secondary" className="payment-option-desc">
                Bạn chỉ phải thanh toán khi nhận được hàng
              </Text>
            </div>
          </Radio>
        </div>
        
        <div className="payment-option" style={{ marginBottom: 16 }}>
          <Radio value="Banking" className="payment-radio">
            <div className="payment-option-content">
              <div className="payment-option-title">
                <BankOutlined className="payment-icon banking-icon" style={{ color: '#1890ff', marginRight: 8 }} />
                <Text strong>Chuyển khoản ngân hàng</Text>
              </div>
              <Text type="secondary" className="payment-option-desc">
                Chuyển khoản qua tài khoản ngân hàng
              </Text>
            </div>
          </Radio>
          
          {currentValue === 'Banking' && (
            <div className="payment-details" style={{ marginTop: 16, marginLeft: 24 }}>
              <Collapse 
                defaultActiveKey={['1']} 
                ghost
                expandIcon={({ isActive }) => <RightOutlined rotate={isActive ? 90 : 0} />}
              >
                <Panel header="Thông tin tài khoản ngân hàng" key="1">
                  <div className="bank-info">
                    <List
                      itemLayout="horizontal"
                      dataSource={[
                        { label: 'Ngân hàng', value: 'BIDV - Ngân hàng Đầu tư & Phát triển Việt Nam' },
                        { label: 'Số tài khoản', value: '12345678900' },
                        { label: 'Chủ tài khoản', value: 'CÔNG TY CỔ PHẦN THÚ CƯNG XYZ' },
                        { label: 'Nội dung CK', value: 'Thanh toan don hang [Tên của bạn]' },
                      ]}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            title={item.label}
                            description={item.value}
                          />
                        </List.Item>
                      )}
                    />
                    <Alert
                      message="Lưu ý"
                      description="Vui lòng chuyển khoản trước khi chúng tôi xử lý đơn hàng của bạn. Đơn hàng sẽ được xác nhận sau khi chúng tôi nhận được thanh toán."
                      type="warning"
                      showIcon
                    />
                  </div>
                </Panel>
              </Collapse>
            </div>
          )}
        </div>
        
        <div className="payment-option" style={{ marginBottom: 16 }}>
          <Radio value="MoMo" className="payment-radio">
            <div className="payment-option-content">
              <div className="payment-option-title">
                <WalletOutlined className="payment-icon momo-icon" style={{ color: '#d91dff', marginRight: 8 }} />
                <Text strong>Thanh toán qua ví MoMo</Text>
              </div>
              <Text type="secondary" className="payment-option-desc">
                Thanh toán an toàn qua ví điện tử MoMo
              </Text>
            </div>
          </Radio>
          
          {currentValue === 'MoMo' && (
            <div className="payment-details" style={{ marginTop: 16, marginLeft: 24 }}>
              <Collapse 
                defaultActiveKey={['1']} 
                ghost
                expandIcon={({ isActive }) => <RightOutlined rotate={isActive ? 90 : 0} />}
              >
                <Panel header="Thông tin thanh toán MoMo" key="1">
                  <div className="momo-info">
                    <div className="momo-qr" style={{ textAlign: 'center', marginBottom: 16 }}>
                      <img 
                        src="/momo-qr.png" 
                        alt="MoMo QR Code" 
                        className="qr-image"
                        style={{ width: 150, height: 150 }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/150?text=MoMo+QR";
                        }}
                      />
                    </div>
                    <List
                      itemLayout="horizontal"
                      dataSource={[
                        { label: 'Số điện thoại', value: '0987654321' },
                        { label: 'Tên tài khoản', value: 'CÔNG TY CỔ PHẦN THÚ CƯNG XYZ' },
                        { label: 'Nội dung chuyển tiền', value: 'Thanh toan don hang [Tên của bạn]' },
                      ]}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            title={item.label}
                            description={item.value}
                          />
                        </List.Item>
                      )}
                    />
                    <Alert
                      message="Lưu ý"
                      description="Vui lòng thanh toán trước khi chúng tôi xử lý đơn hàng của bạn. Đơn hàng sẽ được xác nhận sau khi chúng tôi nhận được thanh toán."
                      type="warning"
                      showIcon
                    />
                  </div>
                </Panel>
              </Collapse>
            </div>
          )}
        </div>
      </Radio.Group>
    </div>
  );
};

export default PaymentMethodSelector;