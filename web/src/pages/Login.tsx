
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LockKeyhole, User } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';


type UserRole = 'admin' | 'principal' | 'secretary' | 'faculty' | 'staff';

interface PredefinedUser {
  id: string;
  name: string;
  username: string;
  password: string;
  userRoles: UserRole[];
}


const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('single');
  const navigate = useNavigate();
  const { login } = useAuth();

  // Predefined users


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('Please fill all fields');
      return;
    }

    login({ username, password });

    // Find user with matching credentials
    // const foundUser = predefinedUsers.find(
    //   user => user.username === username && user.password === password
    // );

    // if (foundUser) {
    //   toast.success(`Welcome back, ${foundUser.name}`);
      navigate('/dashboard');
    // } else {
    //   toast.error('Invalid credentials');
    // }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">School Management System</h1>
          <p className="text-muted-foreground mt-2">Sign in to access your account</p>
        </div>

        <Card>
          <form onSubmit={handleLogin}>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Tabs defaultValue="single" value={activeTab} onValueChange={setActiveTab}>
                {/* <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="single">Single Role</TabsTrigger>
                  <TabsTrigger value="multi">Multi Role</TabsTrigger>
                </TabsList> */}

                <TabsContent value="single" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Login with a single role account (admin, principal, secretary, faculty, or staff)
                  </p>
                </TabsContent>

                <TabsContent value="multi" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Login with a multi-role account (e.g., Will Smith - faculty and staff)
                  </p>
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Username
                </Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <LockKeyhole className="h-4 w-4" /> Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full">Sign in</Button>
            </CardFooter>
          </form>
        </Card>

        {/* <div className="mt-6 text-center text-sm text-muted-foreground">
          <p className="mb-1">For demo purposes, use one of these accounts:</p>
          {activeTab === 'single' ? (
            <div className="grid grid-cols-1 gap-2 mt-2 text-left max-h-32 overflow-y-auto">
              {predefinedUsers.slice(0, 5).map(user => (
                <div key={user.id} className="text-xs p-1 border rounded">
                  <p><strong>Username:</strong> {user.username}</p>
                  <p><strong>Password:</strong> {user.password}</p>
                  <p><strong>Role:</strong> {user.userRoles.join(', ')}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 mt-2 text-left">
              <div className="text-xs p-1 border rounded">
                <p><strong>Username:</strong> wsmith</p>
                <p><strong>Password:</strong> wsmith123</p>
                <p><strong>Roles:</strong> faculty, staff</p>
              </div>
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default Login;
