import React, { useState, useEffect } from 'react';
import { Comment } from "../../../../api/Models/Comment";
import { User } from "../../../../api/Models/User";
import { fetchComments, addComment } from '../../../../api/fetchs/commentApi';

interface TaskCommentsProps {
  taskId: number;
  currentUser: User;
  users: User[];
}

export const TaskComments: React.FC<TaskCommentsProps> = ({ taskId, currentUser, users }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;


    const loadComments = async () => {
      try {
        setIsLoading(true);
        setComments([]); // Очищаем перед загрузкой новых
        setError(null);

        const data = await fetchComments(taskId);
        if (isActive) {
          setComments(data);
        }
      } catch (err) {
        if (isActive) {
          setError('Не удалось загрузить комментарии');
        }
        console.error(err);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadComments();

    return () => {
      isActive = false; // Отменяем подписку при размонтировании
    };
  }, [taskId]);

  // Отправка нового комментария
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsSending(true);
      const comment = await addComment({
        task: taskId,
        text: newComment,
        author: currentUser.id
      });

      setComments(prev => [
          ...prev, {
        ...comment,
        author: currentUser.id,
        author_detail: currentUser.id
      }]);
      setNewComment('');
    } catch (err) {
      setError('Не удалось отправить комментарий');
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  // Получение имени автора
  const getAuthorName = (author: User | number): string => {
    if (typeof author === 'number') {
      const user = users.find(u => u.id === author);
      return user ? `${user.name} ${user.surname}` : `Пользователь #${author}`;
    }
    return `${author.name} ${author.surname}`;
  };

  if (isLoading) return <div className="loading">Загрузка комментариев...</div>;


  return (
    <div className="task-comments" style={{
      borderTop: '1px solid #eaeaea',
      paddingTop: '20px',
      marginTop: '20px'
    }}>
      <h3 style={{ marginBottom: '15px' }}>Комментарии</h3>

      <div className="comments-list" style={{
        maxHeight: '300px',
        overflowY: 'auto',
        marginBottom: '15px',
        paddingRight: '10px'
      }}>
        {comments.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999' }}>Нет комментариев</div>
        ) : (
          comments.map(comment => {
            const isCurrentUser = typeof comment.author === 'number'
              ? comment.author === currentUser.id
              : comment.author.id === currentUser.id;

            return (
              <div
                key={comment.id}
                style={{
                  marginBottom: '12px',
                  padding: '10px 15px',
                  backgroundColor: isCurrentUser ? '#E3F2FD' : '#f5f5f5',
                  borderRadius: '12px',
                  marginLeft: isCurrentUser ? 'auto' : '0',
                  maxWidth: '80%',
                  wordBreak: 'break-word'
                }}
              >
                <div style={{
                  fontSize: '0.8em',
                  color: '#555',
                  marginBottom: '5px',
                  fontWeight: 'bold'
                }}>
                  {getAuthorName(comment.author)}
                </div>
                <div style={{ marginBottom: '5px' }}>{comment.text}</div>
                <div style={{
                  fontSize: '0.7em',
                  color: '#999',
                  textAlign: 'right'
                }}>
                  {new Date(comment.created_at).toLocaleString()}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="comment-input" style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Написать комментарий..."
          onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
          style={{
            flex: 1,
            padding: '10px 15px',
            borderRadius: '20px',
            border: '1px solid #ddd',
            outline: 'none'
          }}
          disabled={isSending}
        />
        <button
          onClick={handleSubmitComment}
          disabled={!newComment.trim() || isSending}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#0088cc',
            border: 'none',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: !newComment.trim() ? 0.5 : 1
          }}
        >
          {isSending ? (
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid white',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};