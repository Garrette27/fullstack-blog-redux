import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchBlogs, setPage } from '../store/slices/blogSlice';

export const BlogList = () => {
  const dispatch = useAppDispatch();
  const { blogs, pagination, loading } = useAppSelector((state) => state.blogs);

  useEffect(() => {
    dispatch(fetchBlogs({ page: pagination.page, limit: pagination.limit }));
  }, [dispatch, pagination.page, pagination.limit]);

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setPage(newPage));
    }
  };

  if (loading && blogs.length === 0) {
    return (
      <div style={styles.container}>
        <p>Loading blogs...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>All Blogs</h1>
      {blogs.length === 0 ? (
        <p style={styles.empty}>No blogs found. Create your first blog!</p>
      ) : (
        <>
          <div style={styles.blogGrid}>
            {blogs.map((blog) => (
              <div key={blog.id} style={styles.blogCard}>
                {blog.image_url && (
                  <img src={blog.image_url} alt={blog.title} style={styles.image} />
                )}
                <div style={styles.cardContent}>
                  <h2 style={styles.blogTitle}>{blog.title}</h2>
                  <p style={styles.blogExcerpt}>
                    {blog.content.length > 150
                      ? `${blog.content.substring(0, 150)}...`
                      : blog.content}
                  </p>
                  <div style={styles.cardFooter}>
                    <Link to={`/blogs/${blog.id}`} style={styles.readMore}>
                      Read More →
                    </Link>
                    <span style={styles.date}>
                      {new Date(blog.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                style={styles.paginationButton}
              >
                Previous
              </button>
              <span style={styles.pageInfo}>
                Page {pagination.page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === totalPages}
                style={styles.paginationButton}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  title: {
    marginBottom: '2rem',
    color: '#333',
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    fontSize: '1.1rem',
    marginTop: '3rem',
  },
  blogGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem',
  },
  blogCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    transition: 'transform 0.2s',
  },
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  cardContent: {
    padding: '1.5rem',
  },
  blogTitle: {
    marginBottom: '0.5rem',
    color: '#333',
    fontSize: '1.25rem',
  },
  blogExcerpt: {
    color: '#666',
    marginBottom: '1rem',
    lineHeight: '1.6',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readMore: {
    color: '#333',
    textDecoration: 'none',
    fontWeight: '500',
  },
  date: {
    color: '#999',
    fontSize: '0.875rem',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '2rem',
  },
  paginationButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  pageInfo: {
    color: '#333',
    fontWeight: '500',
  },
};
