import { useState } from "react";
import { useLocation } from "wouter";
import { signInWithGoogle } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect if already logged in
  if (user && !loading) {
    setLocation("/dashboard");
    return null;
  }

  const handleGoogleLogin = async () => {
    // Bypass authentication and go directly to dashboard
    setLocation("/dashboard");
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Bypass authentication and go directly to dashboard
    setLocation("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <i className="fas fa-leaf text-3xl text-primary animate-pulse"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Xener Home</h1>
          <p className="text-gray-600">Smart Energy Tracker & Saver</p>
        </div>

        {/* Login Form */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Welcome Back</h2>
            
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              
              <Button 
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <Button
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full mt-4 bg-white border border-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
              >
                <i className="fab fa-google text-red-500 mr-3"></i>
                Continue with Google
              </Button>
            </div>

            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account? 
              <a href="#" className="text-primary font-semibold ml-1">Sign up</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
