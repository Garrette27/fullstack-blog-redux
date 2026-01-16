import { useState, FormEvent, ChangeEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createComment, updateComment, clearError } from '../store/slices/commentSlice';
import { supabase } from '../lib/supabase';

interface CommentFormProps {
  blogId: string;
  editingCommentId?: string | null;
  initialContent?: string;
  initialFileUrl?: string | null;
  onCancel?: () => void;
}

export const CommentForm = ({
  blogId,
  editingCommentId,
  initialContent = '',
  initialFileUrl = null,
  onCancel,
}: CommentFormProps) => {
  const [content, setContent] = useState(initialContent);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(initialFileUrl);
  const [uploading, setUploading] = useState(false);

  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.comments);
  const { user } = useAppSelector((state) => state.auth);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  const uploadFile = async (): Promise<string | null> => {
    if (!file || !user) return initialFileUrl;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `comments/${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('blog-images').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return initialFileUrl;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    let fileUrl: string | null = initialFileUrl;
    if (file) {
      fileUrl = await uploadFile();
    } else if (!filePreview && initialFileUrl) {
      // File was removed
      fileUrl = null;
    }

    if (editingCommentId) {
      // Update existing comment
      const result = await dispatch(updateComment({ id: editingCommentId, content, fileUrl }));
      if (updateComment.fulfilled.match(result)) {
        setContent('');
        setFile(null);
        setFilePreview(null);
        onCancel?.();
      }
    } else {
      // Create new comment
      const result = await dispatch(createComment({ blogId, content, fileUrl }));
      if (createComment.fulfilled.match(result)) {
        setContent('');
        setFile(null);
        setFilePreview(null);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          required
          rows={3}
          style={styles.textarea}
        />
      </div>
      <div style={styles.formGroup}>
        <input
          type="file"
          id="comment-file"
          accept="image/*"
          onChange={handleFileChange}
          style={styles.fileInput}
        />
        {filePreview && (
          <div style={styles.previewContainer}>
            {filePreview.startsWith('data:') || filePreview.startsWith('http') ? (
              <img src={filePreview} alt="Preview" style={styles.preview} />
            ) : (
              <a href={filePreview} target="_blank" rel="noopener noreferrer" style={styles.fileLink}>
                View attached file
              </a>
            )}
            <button type="button" onClick={removeFile} style={styles.removeButton}>
              Remove
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
          {uploading ? 'Uploading...' : loading ? 'Saving...' : editingCommentId ? 'Update Comment' : 'Post Comment'}
        </button>
        {editingCommentId && (
          <button type="button" onClick={onCancel} style={styles.cancelButton}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  form: {
    marginBottom: '1.5rem',
  },
  formGroup: {
    marginBottom: '1rem',
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
    fontSize: '0.875rem',
  },
  previewContainer: {
    marginTop: '0.5rem',
    padding: '0.5rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
  preview: {
    maxWidth: '100%',
    maxHeight: '200px',
    borderRadius: '4px',
    marginBottom: '0.5rem',
  },
  fileLink: {
    color: '#333',
    textDecoration: 'underline',
    display: 'block',
    marginBottom: '0.5rem',
  },
  removeButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#d32f2f',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  error: {
    color: '#d32f2f',
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  submitButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#ccc',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
};
