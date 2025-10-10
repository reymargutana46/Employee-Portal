import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LockKeyhole, User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

type UserRole = "admin" | "principal" | "secretary" | "faculty" | "staff";

interface PredefinedUser {
  id: string;
  name: string;
  username: string;
  password: string;
  userRoles: UserRole[];
}

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("single");
  const navigate = useNavigate();
  const { login } = useAuth();

  // Predefined users

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please fill all fields");
      return;
    }

    login({ username, password });


    // if (foundUser) {
    //   toast.success(`Welcome back, ${foundUser.name}`);
    // navigate('/dashboard');
    // } else {
    //   toast.error('Invalid credentials');
    // }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
        <img
          src="/src/images/logos.png"
          alt="Naawan Central School Logo"
          className="mx-auto mb-2 w-20 h-25 object-contain"
          />
        <h1 className="text-3xl font-bold text-primary">Employee Portal System</h1>
    </div>


        <Card className="shadow-md">
          <form onSubmit={handleLogin}>
            <CardHeader className="mx-auto text-center pb-10">
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Tabs
                defaultValue="single"
                value={activeTab}
                onValueChange={setActiveTab}
              ></Tabs>

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

            <CardFooter className="pt-6">
              <Button type="submit" className="w-full">
                Sign in
              </Button>
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
