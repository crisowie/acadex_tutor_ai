import { Layout } from "@/components/Layout";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as ToasterComponent } from "react-hot-toast";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import AskQuestion from "./pages/AskQuestion";
import BetaPage from "./pages/Beta";
import Bookmarks from "./pages/Bookmarks";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Landing";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Quizzes from "./pages/Quizzes";
import QuizPage from "./pages/QuizPage";
import Resources from "./pages/Resources";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Community from "./pages/Community";
import AccountPage from "./pages/AccountPage";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./utils/ProtectedRoute";
import CompleteProfile from "./pages/completeProfile";
import { ChatProvider } from "@/context/ChatContext";
import SessionTracker from "./components/SessionTracker";
import { NotesProvider } from "./context/NoteContext";
import { WatchPage } from "./pages/WatchPage";
import OnboardingPage from "./pages/Onboarding";
import { QuizProvider } from "@/context/QuizContext";
import Notes from "./pages/Notes";
const queryClient = new QueryClient();

const App = () => {

  const location = useLocation();
  const showNavbar = ["/", "/login", "/signup"].includes(location.pathname);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChatProvider>
          <NotesProvider>
            <QuizProvider>
              <TooltipProvider>
                <ToasterComponent />
                <SessionTracker />
                <Toaster />
                <Sonner />

                {showNavbar && <Navbar />}

                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Protected Routes with Layout */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/ask"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <AskQuestion />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <AccountPage />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/onboarding"
                    element={
                      <ProtectedRoute>
                        <OnboardingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat/:chatId"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <AskQuestion />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile-setup"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <CompleteProfile />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/quizzes"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Quizzes />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/quiz/:quizId"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <QuizPage />
                        </Layout>
                      </ProtectedRoute>
                    } />

                  <Route
                    path="/bookmarks"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Bookmarks />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/community"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Community />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/resources"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Resources />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/note"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Notes />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/watch/:videoId"
                    element={
                      <ProtectedRoute>
                        <WatchPage />
                      </ProtectedRoute>

                    }
                  />
                  <Route
                    path="/beta"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <BetaPage />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Settings />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Not Found */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </QuizProvider>
          </NotesProvider>


        </ChatProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
