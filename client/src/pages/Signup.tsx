import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import GoogleSignInButton from "../components/GoogleButton";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [fullName, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!email || !password || !fullName) {
      return toast.error("Please fill in all fields.");
    }
    if (fullName.length < 3) {
      return toast.error("Name must be at least 3 characters.");
    }
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    try {
      setIsLoading(true);
      const success = await signup(fullName, email, password);

      if (success) {
        toast.success("Signup successful!");
        navigate("/onboarding");
      } else {
        toast.error("Signup failed. Try again.");
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Signup failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 pt-20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-2xl font-bold">Welcome to Acadex</CardTitle>
          <CardDescription>Sign up for your AI Academic Tutor account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="fullName"
                type="text"
                disabled={isLoading ? true : false}
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setName(e.target.value)}
                className="bg-input border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                disabled={isLoading ? true : false}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                disabled={isLoading ? true : false}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input border-border"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 text-white hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Sign Up"}
            </Button>

            <div className="flex items-center gap-4 my-6">
              <hr className="flex-grow border-muted" />
              <span className="text-muted-foreground text-sm">Or Continue</span>
              <hr className="flex-grow border-muted" />
            </div>
          </form>
          <div className="pt-3">
          <GoogleSignInButton />
          </div>
       

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
