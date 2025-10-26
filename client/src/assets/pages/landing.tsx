import { GraduationCap, BookOpen, Headphones, TrendingUp, Users, Star, CheckCircle } from "lucide-react";
import { Button } from "@/assets/ui/button";
import { Card, CardContent } from "@/assets/ui/card";
import { Link } from "wouter";
import { COMPANY_NAME } from "../Constants";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-light to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-green rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white" size={18} />
              </div>
              <span className="font-bold text-xl text-primary">{COMPANY_NAME}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-primary mb-6">
            Master Your IELTS Skills
          </h1>
          <p className="text-xl text-secondary mb-8 max-w-2xl mx-auto">
            Practice Reading and Listening with authentic test materials. 
            Track your progress and achieve your target band score.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-primary-green hover:bg-green-medium text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-secondary max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools and practice materials 
              you need to excel in your IELTS exam.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="text-blue-500" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-4">Reading Practice</h3>
                <p className="text-secondary">
                  Academic and General Training texts with authentic question types and time management practice.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Headphones className="text-purple-500" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-4">Listening Practice</h3>
                <p className="text-secondary">
                  Practice with various accents and contexts from social situations to academic lectures.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-light rounded-lg flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="text-primary-green" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-4">Progress Tracking</h3>
                <p className="text-secondary">
                  Detailed analytics and performance insights to identify strengths and areas for improvement.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary-green text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Achieve Your Target Score?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of successful IELTS candidates who achieved their goals with our platform.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-white text-primary-green hover:bg-gray-100">
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-green rounded-lg flex items-center justify-center">
                  <GraduationCap className="text-white" size={18} />
                </div>
                <span className="font-bold text-xl">{COMPANY_NAME}</span>
              </div>
              <p className="text-gray-400">
                Your trusted partner for IELTS preparation success.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Practice</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Reading Tests</li>
                <li>Listening Tests</li>
                <li>Progress Tracking</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Study Tips</li>
                <li>Test Strategies</li>
                <li>Score Calculator</li>
                <li>FAQ</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2024 IELTS Practice Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}