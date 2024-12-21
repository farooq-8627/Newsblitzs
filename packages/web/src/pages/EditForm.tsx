import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArticleForm from '../components/Form';

interface Article {
  _id: string;
  imageLink: string;
  heading: string;
  text: string;
  uploadedAt: string;
}

const EditForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/articles/${id}`
        );
        setArticle(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to fetch the article. Please try again.');
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handleSuccess = () => {
    navigate('/'); // Redirect to articles list after successful edit
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Loading article...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-red-600">Article not found</div>
      </div>
    );
  }

  return (
    <ArticleForm
      mode="edit"
      initialValues={{
        imageLink: article.imageLink,
        heading: article.heading,
        text: article.text
      }}
      articleId={id}
      onSuccess={handleSuccess}
    />
  );
};

export default EditForm;