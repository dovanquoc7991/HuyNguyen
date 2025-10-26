import { useState } from "react";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { Button } from "@/assets/ui/button";
import { Input } from "@/assets/ui/input";
import { Card, CardContent, CardHeader } from "@/assets/ui/card";
import { Label } from "@//assets/ui/label";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/assets/hooks/use-auth";
import { MdArrowBack } from "react-icons/md";
import "../css/Register.css"; // Assuming you have a CSS file for styles

export default function Register() {
  const { register } = useAuth();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await register(formData.firstName, formData.lastName, formData.email, formData.password);
      if (res.success) {
        setRegisterSuccess(res.message);
        setRegisterError("");
      } else {
        setRegisterError(res.message);
        setRegisterSuccess("");
      }
    } catch (error: any) {
      setRegisterError(error.message);
      setRegisterSuccess("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen from-green-light to-white flex items-center justify-center px-6 register-bg">
      <div className="w-full max-w-md">
        {/* Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center text-primary">Sign Up</h1>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="text"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {registerError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                  {registerError}
                </div>
              )}

              {registerSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
                  {registerSuccess}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary-green hover:bg-green-medium text-white"
                size="lg"
              >
                Sign Up
              </Button>
              <button
          type="button"
          className="login-btn login-btn-secondary"
          style={{
            marginTop: 10,
            background: "transparent",
            color: "#1976d2",
            border: "none",
            display: "flex",
            alignItems: "center",
            gap: 6,
            justifyContent: "center",
            fontWeight: "500",
            cursor: "pointer",
            marginLeft: "auto",
            marginRight: "auto",
          }}
          onClick={() => setLocation("/practice/reading")}
        >
          <MdArrowBack size={20} />
          Back to Home
        </button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Links */}
      </div>
    </div>
  );
}