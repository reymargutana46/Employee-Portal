import { useAuthStore } from '@/store/useAuthStore';

const AuthDebug = () => {
  const { user, isAuthenticated, userRoles } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
        <strong>Debug:</strong> Not authenticated
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded z-50 max-w-sm">
      <div className="text-sm">
        <strong>Debug Info:</strong>
        <div>User: {user?.username || 'No username'}</div>
        <div>Roles: {userRoles?.map(r => r.name).join(', ') || 'No roles'}</div>
        <div>User Roles: {user?.roles?.map(r => r.name).join(', ') || 'No user roles'}</div>
        <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
};

export default AuthDebug;
