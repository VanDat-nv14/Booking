import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Typography, 
  Collapse, 
  Row, 
  Col, 
  Card, 
  Divider,
  theme
} from 'antd';
import { 
  QuestionCircleOutlined, 
  DownOutlined,
  MessageOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { useToken } = theme;

const FAQSection = () => {
  const { token } = useToken();
  const [isVisible, setIsVisible] = useState(false);
  const [activeKey, setActiveKey] = useState([]);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.disconnect();
      }
    };
  }, []);

  // Danh sách câu hỏi thường gặp
  const faqItems = [
    {
      id: 'panel1',
      question: 'Làm thế nào để đặt lịch hẹn?',
      answer: 'Bạn có thể đặt lịch hẹn trực tuyến thông qua trang web của chúng tôi bằng cách đăng nhập vào tài khoản của bạn và chọn "Đặt lịch hẹn". Ngoài ra, bạn cũng có thể gọi trực tiếp đến số điện thoại của chúng tôi để được nhân viên hỗ trợ đặt lịch.'
    },
    {
      id: 'panel2',
      question: 'Các dịch vụ cơ bản cho thú cưng gồm những gì?',
      answer: 'Các dịch vụ cơ bản bao gồm khám sức khỏe định kỳ, tiêm phòng, tắm và vệ sinh, cắt tỉa lông, cắt móng và vệ sinh tai. Ngoài ra, chúng tôi còn cung cấp các dịch vụ chuyên sâu như điều trị bệnh, phẫu thuật, điều trị nha khoa, và tư vấn dinh dưỡng.'
    },
    {
      id: 'panel3',
      question: 'Tần suất khám sức khỏe cho thú cưng là bao lâu?',
      answer: 'Chúng tôi khuyến nghị khám sức khỏe định kỳ 6 tháng một lần cho thú cưng trưởng thành và 3 tháng một lần cho thú cưng già hoặc có bệnh nền. Đối với thú cưng dưới 1 tuổi, nên khám mỗi 3-4 tháng để đảm bảo sự phát triển khỏe mạnh và tiêm phòng đầy đủ.'
    },
    {
      id: 'panel4',
      question: 'Làm thế nào để chuẩn bị cho buổi khám đầu tiên?',
      answer: 'Hãy mang theo hồ sơ tiêm chủng và y tế trước đây (nếu có), và đến sớm khoảng 15 phút để hoàn thành các thủ tục cần thiết. Nếu thú cưng của bạn đang dùng thuốc, hãy mang theo để bác sĩ có thể xem xét. Ngoài ra, hãy chuẩn bị danh sách các câu hỏi hoặc mối quan tâm mà bạn muốn trao đổi với bác sĩ.'
    },
    {
      id: 'panel5',
      question: 'Có cần lịch hẹn trước khi mang thú cưng đến không?',
      answer: 'Chúng tôi khuyến khích đặt lịch hẹn trước để đảm bảo thú cưng của bạn được chăm sóc đúng thời gian và không phải chờ đợi. Tuy nhiên, chúng tôi vẫn tiếp nhận các trường hợp khẩn cấp mà không cần lịch hẹn. Nếu thú cưng của bạn cần chăm sóc y tế khẩn cấp, hãy gọi cho chúng tôi trước khi đến để chúng tôi có thể chuẩn bị.'
    },
    {
      id: 'panel6',
      question: 'Các dịch vụ chăm sóc thú cưng tại nhà có những gì?',
      answer: 'Dịch vụ chăm sóc tại nhà của chúng tôi bao gồm tiêm phòng, khám sức khỏe cơ bản, cắt tỉa lông và móng, vệ sinh tai và răng. Đối với các trường hợp cần thiết bị chuyên dụng hoặc điều trị phức tạp, bạn vẫn cần đưa thú cưng đến phòng khám của chúng tôi.'
    }
  ];

  const handleCollapseChange = (keys) => {
    setActiveKey(keys);
  };

  const fadeInStyle = (index) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    transition: `all 0.5s ease-out ${index * 0.1}s`
  });

  // Tùy chỉnh icon mở rộng cho collapse
  const expandIcon = ({ isActive }) => (
    <DownOutlined
      rotate={isActive ? 180 : 0}
      style={{
        fontSize: 16,
        color: token.colorPrimary,
        transition: 'all 0.3s'
      }}
    />
  );

  return (
    <div
      ref={sectionRef}
      style={{
        padding: '64px 0',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.6s ease-in-out',
        background: `linear-gradient(to bottom, ${token.colorBgContainer}, ${token.colorBgElevated})`
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Title
            level={2}
            style={{
              fontWeight: 700,
              position: 'relative',
              display: 'inline-block',
              marginBottom: 16
            }}
          >
            Câu Hỏi Thường Gặp
          </Title>
          
          <div style={{
            width: 80,
            height: 4,
            background: `linear-gradient(to right, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
            margin: '0 auto 16px',
            borderRadius: 2
          }} />
          
          <Paragraph
            style={{
              fontSize: 16,
              color: token.colorTextSecondary,
              maxWidth: 700,
              margin: '0 auto'
            }}
          >
            Những điều bạn cần biết về dịch vụ chăm sóc thú cưng của chúng tôi
          </Paragraph>
        </div>

        <Row justify="center">
          <Col xs={24} lg={20}>
            <Card
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.07)',
                border: 'none'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: `linear-gradient(to right, ${token.colorPrimary}, ${token.colorInfo})`
                }}
              />
              
              <div style={{ padding: 24 }}>
                <Collapse
                  bordered={false}
                  expandIcon={expandIcon}
                  activeKey={activeKey}
                  onChange={handleCollapseChange}
                  style={{ background: 'transparent' }}
                >
                  {faqItems.map((item, index) => (
                    <Panel
                      key={item.id}
                      header={
                        <div 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            padding: '8px 0'
                          }}
                        >
                          <QuestionCircleOutlined 
                            style={{ 
                              fontSize: 20, 
                              color: token.colorPrimary,
                              marginRight: 16
                            }} 
                          />
                          <Text 
                            style={{ 
                              fontSize: 16, 
                              fontWeight: 600,
                              color: activeKey.includes(item.id) ? token.colorPrimary : token.colorText
                            }}
                          >
                            {item.question}
                          </Text>
                        </div>
                      }
                      style={{
                        marginBottom: 16,
                        borderRadius: 8,
                        border: `1px solid ${token.colorBorderSecondary}`,
                        background: token.colorBgContainer,
                        ...fadeInStyle(index + 1)
                      }}
                    >
                      <div style={{ paddingLeft: 36 }}>
                        <Paragraph 
                          style={{ 
                            fontSize: 15, 
                            color: token.colorTextSecondary,
                            lineHeight: 1.8,
                            margin: 0
                          }}
                        >
                          {item.answer}
                        </Paragraph>
                      </div>
                    </Panel>
                  ))}
                </Collapse>
              </div>
            </Card>
            
            <div 
              style={{ 
                textAlign: 'center', 
                marginTop: 24,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.5s ease-out 0.8s'
              }}
            >
              <Text style={{ color: token.colorTextSecondary, fontSize: 14 }}>
                Không tìm thấy câu trả lời cho câu hỏi của bạn? Hãy{' '}
                <Link 
                  to="/contact" 
                  style={{ 
                    color: token.colorPrimary, 
                    fontWeight: 600 
                  }}
                >
                  liên hệ với chúng tôi
                </Link>
                {' '}để được hỗ trợ.
              </Text>
            </div>
          </Col>
        </Row>
        
        {/* Thêm phần nhỏ để layout thêm hấp dẫn */}
        <Row justify="center" style={{ marginTop: 48 }}>
          <Col xs={24} sm={18} md={16} style={{ textAlign: 'center' }}>
            <Card
              style={{
                background: `linear-gradient(135deg, ${token.colorPrimaryBg}, ${token.colorPrimaryBgHover})`,
                borderRadius: 16,
                border: 'none',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
                padding: 8,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.5s ease-out 1s'
              }}
            >
              <div style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageOutlined 
                  style={{ 
                    fontSize: 28, 
                    color: token.colorPrimary,
                    marginRight: 16
                  }} 
                />
                <div style={{ textAlign: 'left' }}>
                  <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                    Bạn có câu hỏi khác?
                  </Title>
                  <Text style={{ color: token.colorTextSecondary }}>
                    Liên hệ ngay với đội ngũ hỗ trợ của chúng tôi
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default FAQSection;