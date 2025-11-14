import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

interface AuthValidatorProps {
  children: React.ReactNode;
}

const AuthValidator = ({ children }: AuthValidatorProps) => {
  const [isValidating, setIsValidating] = useState(true);
  const [validationTimeout, setValidationTimeout] = useState(false);
  const { isAuthenticated, validateAuth, clearAuthState } = useAuthStore();

  useEffect(() => {
    const validateAuthentication = async () => {
      try {
        if (isAuthenticated) {
          // Validate the existing authentication
          const isValid = await validateAuth();
          if (!isValid) {
            console.log('Authentication validation failed, clearing state');
            clearAuthState();
            localStorage.removeItem('auth');
          }
        }
      } catch (error) {
        console.error('Authentication validation error:', error);
        // If validation fails, clear everything
        clearAuthState();
        localStorage.removeItem('auth');
      } finally {
        setIsValidating(false);
      }
    };

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setValidationTimeout(true);
      setIsValidating(false);
    }, 10000); // 10 second timeout

    validateAuthentication();

    return () => clearTimeout(timeout);
  }, [isAuthenticated, validateAuth, clearAuthState]);

  // Show loading screen while validating
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-primary">Validating...</h2>
          <div className="animate-pulse bg-primary/20 h-2 w-32 mx-auto rounded"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthValidator;