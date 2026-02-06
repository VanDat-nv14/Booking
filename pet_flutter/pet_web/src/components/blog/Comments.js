import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const CommentsContainer = styled.div`
  margin-top: 40px;
  border-top: 1px solid #eee;
  padding-top: 30px;
`;

const CommentTitle = styled.h3`
  font-size: 22px;
  margin-bottom: 20px;
  font-weight: 600;
`;

const CommentsList = styled.div`
  margin-bottom: 30px;
`;

const CommentItem = styled.div`
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #3a8bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 10px;
`;

const CommentInfo = styled.div`
  flex: 1;
  
  .name {
    font-weight: 600;
    color: #333;
  }
  
  .date {
    font-size: 14px;
    color: #888;
  }
`;

const CommentContent = styled.div`
  font-size: 16px;
  line-height: 1.5;
  color: #444;
  margin-left: 50px;
  word-break: break-word;
`;

const CommentForm = styled.form`
  margin-top: 30px;
`;

const Textarea = styled.textarea`
  width: 100%;
  border: 1px solid #d9d9d9;
  border-radius: 5px;
  padding: 12px 15px;
  font-size: 16px;
  min-height: 120px;
  margin-bottom: 15px;
  
  &:focus {
    border-color: #3a8bff;
    outline: none;
    box-shadow: 0 0 0 2px rgba(58, 139, 255, 0.2);
  }
`;

const SubmitButton = styled.button`
  background-color: #3a8bff;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #2a7ae2;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const LoginMessage = styled.div`
  text-align: center;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 5px;
  margin-top: 20px;
  
  a {
    color: #3a8bff;
    font-weight: 500;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 20px;
  color: #888;
`;

const NoCommentsMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #888;
  font-style: italic;
`;

const Comments = ({ comments, loading, onSubmit, isAuthenticated }) => {
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    try {
      setSubmitting(true);
      await onSubmit(commentText);
      setCommentText(''); // Clear form after submit
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };
  
  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <CommentsContainer>
      <CommentTitle>Bình luận ({comments ? comments.length : 0})</CommentTitle>
      
      {loading ? (
        <LoadingContainer>Đang tải bình luận...</LoadingContainer>
      ) : (
        <>
          <CommentsList>
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <CommentItem key={comment.commentId}>
                  <CommentHeader>
                    <Avatar>{getInitials(comment.userName || 'Anonymous User')}</Avatar>
                    <CommentInfo>
                      <div className="name">{comment.userName || 'Anonymous User'}</div>
                      <div className="date">{formatDate(comment.commentDate)}</div>
                    </CommentInfo>
                  </CommentHeader>
                  <CommentContent>{comment.content}</CommentContent>
                </CommentItem>
              ))
            ) : (
              <NoCommentsMessage>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</NoCommentsMessage>
            )}
          </CommentsList>
          
          {isAuthenticated ? (
            <CommentForm onSubmit={handleSubmit}>
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Viết bình luận của bạn..."
                required
              />
              <SubmitButton type="submit" disabled={submitting || !commentText.trim()}>
                {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
              </SubmitButton>
            </CommentForm>
          ) : (
            <LoginMessage>
              Bạn cần <Link to="/login">đăng nhập</Link> để bình luận.
            </LoginMessage>
          )}
        </>
      )}
    </CommentsContainer>
  );
};

export default Comments;