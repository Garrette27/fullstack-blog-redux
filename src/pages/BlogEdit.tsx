import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchBlogById, updateBlog, clearCurrentBlog } from '../store/slices/blogSlice';
import { supabase } from '../lib/supabase';

export const BlogEdit = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentBlog, loading, error } = useAppSelector((state) => state.blogs);
  const { user } = useAppSelector((state) => state.auth);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchBlogById(id));
    }
    return () => {
      dispatch(clearCurrentBlog());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (currentBlog) {
      setTitle(currentBlog.title);
      setContent(currentBlog.content);
      setImagePreview(currentBlog.image_url);
      setRemoveImage(false);
    }
  }, [currentBlog]);

  // Redirect if not owner
  useEffect(() => {
    if (currentBlog && user && currentBlog.user_id !== user.id) {
      navigate('/blogs');
    }
  }, [currentBlog, user, navigate]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setRemoveImage(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setRemoveImage(true);
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !user) return currentBlog?.image_url || null;

    try {
      setUploading(true);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('blog-images').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return currentBlog?.image_url || null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;

    let imageUrl: string | null = currentBlog?.image_url || null;

    // If user chose to remove the image and didn't upload a new one,
    // clear the image URL.
    if (removeImage && !imageFile) {
      imageUrl = null;
    }

    if (imageFile) {
      imageUrl = await uploadImage();
    }

    const result = await dispatch(updateBlog({ id, title, content, imageUrl }));
    if (updateBlog.fulfilled.match(result)) {
      navigate(`/blogs/${id}`);
    }
  };

  if (loading && !currentBlog) {
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
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Edit Blog</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="title" style={styles.label}>
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="content" style={styles.label}>
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={10}
            style={styles.textarea}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="image" style={styles.label}>
            Image (Optional)
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            style={styles.fileInput}
          />
          {imagePreview && (
            <div style={styles.imageWrapper}>
              <img src={imagePreview} alt="Preview" style={styles.preview} />
              <button
                type="button"
                onClick={handleRemoveImage}
                style={styles.removeImageButton}
              >
                Remove Image
              </button>
            </div>
          )}
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <div style={styles.actions}>
          <button
            type="submit"
            disabled={loading || uploading}
            style={styles.submitButton}
          >
            {uploading ? 'Uploading...' : loading ? 'Updating...' : 'Update Blog'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/blogs/${id}`)}
            style={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
  },
  title: {
    marginBottom: '2rem',
    color: '#333',
  },
  form: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#333',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  fileInput: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  preview: {
    marginTop: '1rem',
    maxWidth: '100%',
    maxHeight: '300px',
    borderRadius: '4px',
  },
  imageWrapper: {
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  removeImageButton: {
    alignSelf: 'flex-start',
    padding: '0.5rem 1rem',
    backgroundColor: '#d32f2f',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  error: {
    color: '#d32f2f',
    marginBottom: '1rem',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
  },
  submitButton: {
    padding: '0.75rem 2rem',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '0.75rem 2rem',
    backgroundColor: '#ccc',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
};
