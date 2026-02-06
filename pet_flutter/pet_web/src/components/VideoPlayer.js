import React, { useState, useRef, useEffect } from 'react';
import { PlayCircleOutlined, PauseCircleOutlined, SoundOutlined, AudioMutedOutlined } from '@ant-design/icons';
import './VideoPlayer.css';

const VideoPlayer = ({
  src,
  poster,
  autoplay = false,
  loop = true,
  muted = true,
  controls = true,
  className = '',
  style = {},
  overlayText = '',
  playInView = true, // Chỉ play khi video được nhìn thấy trong viewport
}) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // Khởi tạo video với autoplay và muted
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
    
    video.muted = isMuted;
  }, [isPlaying, isMuted]);

  // Theo dõi khi video xuất hiện trong viewport
  useEffect(() => {
    if (!playInView) return;
    
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5, // Khi 50% video hiển thị trong viewport
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsPlaying(true);
          videoRef.current?.play().catch(() => setIsPlaying(false));
        } else {
          setIsPlaying(false);
          videoRef.current?.pause();
        }
      });
    }, options);

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [playInView]);

  // Xử lý play/pause video
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Xử lý mute/unmute video
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div 
      className={`video-player-container ${className}`} 
      style={style}
      ref={containerRef}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="video-player"
        poster={poster}
        loop={loop}
        playsInline
      >
        <source src={src} type="video/mp4" />
        Trình duyệt của bạn không hỗ trợ thẻ video.
      </video>
      
      {overlayText && (
        <div className="video-overlay-text">
          {overlayText}
        </div>
      )}
      
      {controls && (
        <div className={`video-controls ${showControls ? 'show' : ''}`}>
          <button className="video-control-btn" onClick={togglePlay}>
            {isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
          </button>
          <button className="video-control-btn" onClick={toggleMute}>
            {isMuted ? <AudioMutedOutlined /> : <SoundOutlined />}
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;