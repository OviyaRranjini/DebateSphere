import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';

function ProtectedPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await apiClient.get('/auth/check');
      } catch (err) {
        console.error('Unauthorized:', err);
        navigate('/login');
      }
    };
    checkAuth();
  }, []);
  
  return <div>Protected Content</div>;
}
export default ProtectedPage;