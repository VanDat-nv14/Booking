import React from 'react';
import styled from 'styled-components';

const SharingContainer = styled.div`
  margin: 30px 0;
`;

const Title = styled.h4`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
`;

const SocialButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const SocialButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.bgColor};
  color: white;
  border: none;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 10px rgba(0,0,0,0.15);
  }
`;

const ReactionContainer = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 15px;
`;

const ReactionButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-3px);
  }
  
  &.active {
    .emoji {
      background-color: #e6f7ff;
    }
    
    .count {
      color: #3a8bff;
      font-weight: 600;
    }
  }
`;

const EmojiWrapper = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #f5f5f5;
  margin-bottom: 5px;
  font-size: 20px;
  transition: all 0.2s;
`;

const ReactionCount = styled.span`
  font-size: 13px;
  color: #666;
`;

const SocialSharing = ({ url, title }) => {
  const [reactions, setReactions] = React.useState({
    like: 24,
    love: 18,
    clap: 7,
    wow: 3,
    sad: 1
  });
  
  const [userReaction, setUserReaction] = React.useState(null);
  
  // Chuẩn bị URL chia sẻ
  const shareUrl = encodeURIComponent(url || window.location.href);
  const shareTitle = encodeURIComponent(title || document.title);
  
  // Hàm xử lý chia sẻ
  const handleShare = (platform) => {
    let shareLink = '';
    
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
        break;
      case 'pinterest':
        shareLink = `https://pinterest.com/pin/create/button/?url=${shareUrl}&description=${shareTitle}`;
        break;
      default:
        return;
    }
    
    window.open(shareLink, '_blank', 'width=600,height=400');
  };
  
  // Xử lý cảm xúc
  const handleReaction = (reaction) => {
    // Nếu người dùng đã bày tỏ cảm xúc này rồi thì bỏ chọn
    if (userReaction === reaction) {
      setReactions({
        ...reactions,
        [reaction]: reactions[reaction] - 1
      });
      setUserReaction(null);
    } 
    // Nếu người dùng đã chọn cảm xúc khác thì đổi sang cảm xúc mới
    else if (userReaction) {
      setReactions({
        ...reactions,
        [userReaction]: reactions[userReaction] - 1,
        [reaction]: reactions[reaction] + 1
      });
      setUserReaction(reaction);
    } 
    // Nếu chưa chọn cảm xúc nào
    else {
      setReactions({
        ...reactions,
        [reaction]: reactions[reaction] + 1
      });
      setUserReaction(reaction);
    }
    
    // Trong thực tế sẽ gửi API cập nhật cảm xúc ở đây
  };
  
  return (
    <SharingContainer>
      <Title>Chia sẻ bài viết này</Title>
      <SocialButtons>
        <SocialButton 
          bgColor="#4267B2" 
          onClick={() => handleShare('facebook')}
          aria-label="Chia sẻ lên Facebook"
        >
          <i className="fab fa-facebook-f"></i>
        </SocialButton>
        <SocialButton 
          bgColor="#1DA1F2" 
          onClick={() => handleShare('twitter')}
          aria-label="Chia sẻ lên Twitter"
        >
          <i className="fab fa-twitter"></i>
        </SocialButton>
        <SocialButton 
          bgColor="#0A66C2" 
          onClick={() => handleShare('linkedin')}
          aria-label="Chia sẻ lên LinkedIn"
        >
          <i className="fab fa-linkedin-in"></i>
        </SocialButton>
        <SocialButton 
          bgColor="#E60023" 
          onClick={() => handleShare('pinterest')}
          aria-label="Chia sẻ lên Pinterest"
        >
          <i className="fab fa-pinterest-p"></i>
        </SocialButton>
      </SocialButtons>
      
      <ReactionContainer>
        <ReactionButton 
          className={userReaction === 'like' ? 'active' : ''} 
          onClick={() => handleReaction('like')}
          aria-label="Thích"
        >
          <EmojiWrapper className="emoji">👍</EmojiWrapper>
          <ReactionCount className="count">{reactions.like}</ReactionCount>
        </ReactionButton>
        
        <ReactionButton 
          className={userReaction === 'love' ? 'active' : ''} 
          onClick={() => handleReaction('love')}
          aria-label="Yêu thích"
        >
          <EmojiWrapper className="emoji">❤️</EmojiWrapper>
          <ReactionCount className="count">{reactions.love}</ReactionCount>
        </ReactionButton>
        
        <ReactionButton 
          className={userReaction === 'clap' ? 'active' : ''} 
          onClick={() => handleReaction('clap')}
          aria-label="Vỗ tay"
        >
          <EmojiWrapper className="emoji">👏</EmojiWrapper>
          <ReactionCount className="count">{reactions.clap}</ReactionCount>
        </ReactionButton>
        
        <ReactionButton 
          className={userReaction === 'wow' ? 'active' : ''} 
          onClick={() => handleReaction('wow')}
          aria-label="Ngạc nhiên"
        >
          <EmojiWrapper className="emoji">😮</EmojiWrapper>
          <ReactionCount className="count">{reactions.wow}</ReactionCount>
        </ReactionButton>
        
        <ReactionButton 
          className={userReaction === 'sad' ? 'active' : ''} 
          onClick={() => handleReaction('sad')}
          aria-label="Buồn"
        >
          <EmojiWrapper className="emoji">😢</EmojiWrapper>
          <ReactionCount className="count">{reactions.sad}</ReactionCount>
        </ReactionButton>
      </ReactionContainer>
    </SharingContainer>
  );
};

export default SocialSharing;