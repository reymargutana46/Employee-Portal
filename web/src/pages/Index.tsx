import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, canDoAction } = useAuthStore();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      // GradeLeader-only goes straight to Workload
      const isGradeLeader = canDoAction(['gradeleader']);
      const isFaculty = canDoAction(['faculty']);
      if (isGradeLeader && !isFaculty) {
        navigate('/workload');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, navigate, canDoAction]);
  
  // Loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4 text-primary">Loading...</h2>
        <div className="animate-pulse bg-primary/20 h-2 w-32 mx-auto rounded"></div>
      </div>
    </div>
  );
};

export default Index;
