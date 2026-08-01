import useAuth from '../hooks/useAuth.js';
import LoginForm from './LoginForm.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return children;
};

export default ProtectedRoute;
