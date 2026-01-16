import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchBlogById, deleteBlog, clearCurrentBlog } from '../store/slices/blogSlice';
import { fetchComments, clearComments } from '../store/slices/commentSlice';
import { CommentForm } from '../components/CommentForm';
import { CommentItem } from '../components/CommentItem';

export const BlogView = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentBlog, loading } = useAppSelector((state) => state.blogs);
  const { comments, loading: commentsLoading } = useAppSelector((state) => state.comments);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchBlogById(id));
      dispatch(fetchComments(id));
    }
    return () => {
      dispatch(clearCurrentBlog());
      dispatch(clearComments());
    };
  }, [dispatch, id]);

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this blog?')) {
      const result = await dispatch(deleteBlog(id));
      if (deleteBlog.fulfilled.match(result)) {
        navigate('/blogs');
      }
    }
  };

  const isOwner = currentBlog && user && currentBlog.user_id === user.id;

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentBlog) {
    return (
      <div style={styles.container}>
        <p>Blog not found</p>
        <Link to="/blogs">Back to Blogs</Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Link to="/blogs" style={styles.backLink}>← Back to Blogs</Link>
      <article style={styles.article}>
        <h1 style={styles.title}>{currentBlog.title}</h1>
        {currentBlog.image_url && (
          <img src={currentBlog.image_url} alt={currentBlog.title} style={styles.image} />
        )}
        <div style={styles.meta}>
          <span>Created: {new Date(currentBlog.created_at).toLocaleString()}</span>
          {currentBlog.updated_at !== currentBlog.created_at && (
            <span>Updated: {new Date(currentBlog.updated_at).toLocaleString()}</span>
          )}
        </div>
        <div style={styles.content}>{currentBlog.content}</div>
        {isOwner && (
          <div style={styles.actions}>
            <Link to={`/blogs/edit/${currentBlog.id}`} style={styles.editButton}>
              Edit
            </Link>
            <button onClick={handleDelete} style={styles.deleteButton}>
              Delete
            </button>
          </div>
        )}
      </article>

      {/* Comments Section */}
      <div style={styles.commentsSection}>
        <h2 style={styles.commentsTitle}>Comments ({comments.length})</h2>
        
        {isAuthenticated ? (
          <div style={styles.commentFormContainer}>
            <h3 style={styles.commentFormTitle}>Add a comment</h3>
            <CommentForm blogId={currentBlog.id} />
          </div>
        ) : (
          <p style={styles.loginPrompt}>
            <Link to="/login" style={styles.loginLink}>Login</Link> to post a comment
          </p>
        )}

        {commentsLoading ? (
          <p>Loading comments...</p>
        ) : comments.length === 0 ? (
          <p style={styles.noComments}>No comments yet. Be the first to comment!</p>
        ) : (
          <div style={styles.commentsList}>
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
  },
  backLink: {
    display: 'inline-block',
    marginBottom: '1rem',
    color: '#333',
    textDecoration: 'none',
  },
  article: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  title: {
    marginBottom: '1rem',
    color: '#333',
    fontSize: '2rem',
  },
  image: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  meta: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    color: '#666',
    fontSize: '0.875rem',
  },
  content: {
    lineHeight: '1.8',
    color: '#333',
    whiteSpace: 'pre-wrap',
    marginBottom: '2rem',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '1px solid #eee',
  },
  editButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#333',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#d32f2f',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  commentsSection: {
    marginTop: '2rem',
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  commentsTitle: {
    marginBottom: '1.5rem',
    color: '#333',
    fontSize: '1.5rem',
  },
  commentFormContainer: {
    marginBottom: '2rem',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  },
  commentFormTitle: {
    marginBottom: '1rem',
    color: '#333',
    fontSize: '1rem',
  },
  loginPrompt: {
    marginBottom: '1.5rem',
    color: '#666',
    textAlign: 'center',
    padding: '1rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
  loginLink: {
    color: '#333',
    textDecoration: 'underline',
    fontWeight: '500',
  },
  noComments: {
    textAlign: 'center',
    color: '#666',
    padding: '2rem',
  },
  commentsList: {
    marginTop: '1rem',
  },
};
