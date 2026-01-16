import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { deleteComment } from '../store/slices/commentSlice';
import { CommentForm } from './CommentForm';

interface CommentItemProps {
  comment: {
    id: string;
    blog_id: string;
    user_id: string;
    content: string;
    file_url: string | null;
    created_at: string;
    updated_at: string;
  };
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const isOwner = user && comment.user_id === user.id;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await dispatch(deleteComment(comment.id));
    }
  };

  if (isEditing) {
    return (
      <div style={styles.comment}>
        <CommentForm
          blogId={comment.blog_id}
          editingCommentId={comment.id}
          initialContent={comment.content}
          initialFileUrl={comment.file_url}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div style={styles.comment}>
      <div style={styles.commentHeader}>
        <div style={styles.commentMeta}>
          <span style={styles.commentAuthor}>User {comment.user_id.substring(0, 8)}</span>
          <span style={styles.commentDate}>
            {new Date(comment.created_at).toLocaleString()}
            {comment.updated_at !== comment.created_at && ' (edited)'}
          </span>
        </div>
        {isOwner && (
          <div style={styles.commentActions}>
            <button onClick={() => setIsEditing(true)} style={styles.editButton}>
              Edit
            </button>
            <button onClick={handleDelete} style={styles.deleteButton}>
              Delete
            </button>
          </div>
        )}
      </div>
      <div style={styles.commentContent}>{comment.content}</div>
      {comment.file_url && (
        <div style={styles.fileContainer}>
          {comment.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
            <img src={comment.file_url} alt="Comment attachment" style={styles.commentImage} />
          ) : (
            <a
              href={comment.file_url}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.fileLink}
            >
              📎 View attached file
            </a>
          )}
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  comment: {
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  commentMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  commentAuthor: {
    fontWeight: '500',
    color: '#333',
    fontSize: '0.875rem',
  },
  commentDate: {
    fontSize: '0.75rem',
    color: '#666',
  },
  commentActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  editButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#d32f2f',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  commentContent: {
    color: '#333',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    marginBottom: '0.5rem',
  },
  fileContainer: {
    marginTop: '0.5rem',
    padding: '0.5rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
  commentImage: {
    maxWidth: '100%',
    maxHeight: '300px',
    borderRadius: '4px',
  },
  fileLink: {
    color: '#333',
    textDecoration: 'underline',
  },
};
