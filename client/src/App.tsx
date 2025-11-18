import { Switch, Route, Router, useRoute, useLocation } from "wouter";
import { queryClient } from "./assets/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/assets/hooks/use-auth";
import NotFound from "@/assets/pages/not-found";
import Login from "@/assets/pages/Login";
import Register from "@/assets/pages/register";
import Header from "@/assets/layout/header";
import Footer from "@/assets/layout/footer";
import PracticeDetailPage from "./assets/pages/PracticeDetailPage";
import AdminDashboard from "./assets/pages/AdminDashboard";
import CreateTest from "./assets/pages/create-test";
import TestList from "./assets/pages/test-list";
import { TooltipProvider } from "./assets/ui/tooltip";
import { Toaster } from "./assets/components/ui/toaster";
import Practice from "@/assets/pages/Practice";
import CreateListeningTest from "./assets/pages/create-listening-test";
import ChangePassword from "./assets/pages/ChangePassword";
import UserListPage from "./assets/pages/UserListPage";
import UserSidebar from "./assets/components/UserSidebar";
import CreateWritingTest from "./assets/pages/CreateWritingTest";
import CreateSpeakingTest from "./assets/pages/CreateSpeakingTest";
import { useEffect, useState } from "react";
import { cn } from "./assets/lib/utils";
import Home from "./assets/pages/Home";
import TestLayout from "./assets/components/TestLayout";
import ForgotPassword from "./assets/pages/ForgotPassword";
import ResetPassword from "./assets/pages/ResetPassword";
import CreatePostPage from "./assets/pages/CreatePostPage";
import PostListPage from "./assets/pages/PostListPage";
import FeedbackListPage from "./assets/pages/FeedbackListPage";

function ExamApp() {
  return (
    <main className="min-h-screen bg-neutral-bg">
      <Switch>
        <Route path="/practice/:skill/:part/:id">
          <TestLayout>
            <PracticeDetailPage />
          </TestLayout>
        </Route>
      </Switch>
    </main>
  );
}

function AuthenticatedApp() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-bg">
      <Header />
      <UserSidebar
        onToggle={(collapsed) => setIsSidebarCollapsed(collapsed)}
        menuType="user"
      />
      <div className={cn(
        "flex-1 pt-16 overflow-y-auto transition-all duration-300 main-content",
        isMobile ? "ml-16" : isSidebarCollapsed ? "ml-20" : "ml-64"
      )}>
        <main className="px-1 py-4">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/home" component={Home} />
            <Route path="/practice/:section" component={Practice} />
            <Route path="/register" component={Register} />
            <Route path="/change-password" component={ChangePassword} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
      <Footer />
    </div>
  );
}

function AdminApp() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-bg">
      <Header />
      <UserSidebar
        onToggle={(collapsed) => setIsSidebarCollapsed(collapsed)}
        menuType="admin"
      />
      <div className={cn(
        "flex-1 pt-16 overflow-y-auto transition-all duration-300 main-content",
        isMobile ? "ml-16" : isSidebarCollapsed ? "ml-20" : "ml-64"
      )}>
        <main className="px-4 py-5">
          <PublicAdminPage />
        </main>
      </div>
      <Footer />
    </div>
  );
}

function PublicApp() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/practice/:skill/:part/:id">
        <TestLayout>
          <PracticeDetailPage />
        </TestLayout>
      </Route>
      <Route component={Login} />
    </Switch>
  );
}

function PublicAdminPage() {
  return (
    <Switch>
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/create-reading-test" component={CreateTest} />
      <Route path="/admin/create-listening-test" component={CreateListeningTest} />
      <Route path="/admin/tests" component={TestList} />
      <Route path="/admin/create-writing-test" component={CreateWritingTest} />
      <Route path="/admin/create-speaking-test" component={CreateSpeakingTest} />
      <Route path="/admin/create-reading-test/:id" component={CreateTest} />
      <Route path="/admin/create-listening-test/:id" component={CreateListeningTest} />
      <Route path="/admin/create-speaking-test/:id" component={CreateSpeakingTest} />
      <Route path="/admin/create-writing-test/:id" component={CreateWritingTest} />
      <Route path="/admin/users" component={UserListPage} />
      <Route path="/admin/create-stories" component={CreatePostPage} />
      <Route path="/admin/create-post/:id" component={CreatePostPage} />
      <Route path="/admin/posts" component={PostListPage} />
      <Route path="/admin/feedback" component={FeedbackListPage} />

    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  const isAdminPage = location.startsWith("/admin");
  const isExamPage = /^\/practice\/[^/]+\/[^/]+\/[^/]+$/.test(location);
  const noLayoutRoutes = [
    "/change-password",
    "/register",
  ];

  // Nếu là các trang không cần layout
  if (noLayoutRoutes.includes(location)) {
    return (
      <Switch>
        <Route path="/change-password" component={ChangePassword} />
        <Route path="/register" component={Register} />
      </Switch>
    );
  }

  if (!isAuthenticated) {
    return <PublicApp />;
  }
  if (isAdminPage) {
    return <AdminApp />;
  }

  return isExamPage ? <ExamApp /> : <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;