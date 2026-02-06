import React from 'react';
import { Row, Col, Typography } from 'antd';
import VideoPlayer from '../common/VideoPlayer';
import './FeaturedVideos.css';

const { Title, Paragraph } = Typography;

const FeaturedVideos = () => {
  const videos = [
    {
      id: 1,
      title: 'Dịch vụ chăm sóc thú cưng',
      description: 'Khám phá các dịch vụ chăm sóc thú cưng chất lượng cao tại Pet Care.',
      src: '/videos/pet_care.mp4',
      poster: '/images/pet_care_poster.jpg',
    },
    {
      id: 2,
      title: 'Dịch vụ làm đẹp',
      description: 'Các dịch vụ làm đẹp, cắt tỉa lông chuyên nghiệp cho thú cưng của bạn.',
      src: '/videos/grooming.mp4',
      poster: '/images/grooming_poster.jpg',
    },
    {
      id: 3,
      title: 'Chăm sóc sức khỏe',
      description: 'Đội ngũ bác sĩ thú y giàu kinh nghiệm chăm sóc sức khỏe toàn diện.',
      src: '/videos/veterinary.mp4',
      poster: '/images/veterinary_poster.jpg',
    },
  ];

  return (
    <div className="featured-videos-section">
      <Title level={2} className="section-title">
        Khám phá dịch vụ của chúng tôi
      </Title>
      <Paragraph className="section-description">
        Xem những video giới thiệu về các dịch vụ chăm sóc thú cưng chuyên nghiệp tại Pet Care.
      </Paragraph>
      
      <Row gutter={[24, 24]}>
        {videos.map((video) => (
          <Col xs={24} md={12} lg={8} key={video.id}>
            <div className="video-card">
              <VideoPlayer
                src={video.src}
                poster={video.poster}
                autoplay={false}
                muted={true}
                playInView={true}
                className="featured-video"
              />
              <div className="video-info">
                <Title level={4} className="video-title">{video.title}</Title>
                <Paragraph className="video-description">{video.description}</Paragraph>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default FeaturedVideos;