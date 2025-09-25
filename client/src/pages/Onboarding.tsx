import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  Code, 
  BookOpen, 
  Globe, 
  Clock, 
  GraduationCap,
  Target,
  Trophy,
  Calendar,
  User,
  Sparkles
} from "lucide-react";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, Onboarding } = useAuth();

  // Form data
  const [formData, setFormData] = useState({
    learning_goal: "",
    skill_level: "",
    custom_goal: "",
    study_time: "",
    preferred_subjects: [],
    motivation: "",
    learning_style: "",
    goals_timeline: "",
    experience_years: ""
  });

  const steps = [
    { title: "Welcome", icon: User, description: "Let's get to know you" },
    { title: "Learning Goals", icon: Target, description: "What do you want to achieve?" },
    { title: "Skill Level", icon: Trophy, description: "Where are you now?" },
    { title: "Study Preferences", icon: Clock, description: "How do you prefer to learn?" },
    { title: "Motivation", icon: Sparkles, description: "What drives you?" }
  ];

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  // Skip if user already onboarded
  useEffect(() => {
    const checkProfile = async () => {
      if (user?.learning_goal && user?.skill_level) {
        navigate("/dashboard", { replace: true });
      }
    };
    checkProfile();
  }, [navigate, user]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubjectToggle = (subject) => {
    setFormData(prev => ({
      ...prev,
      preferred_subjects: prev.preferred_subjects.includes(subject)
        ? prev.preferred_subjects.filter(s => s !== subject)
        : [...prev.preferred_subjects, subject]
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // Use custom goal if provided, otherwise use selected goal
      const finalGoal = formData.custom_goal.trim() || formData.learning_goal;
      
      const success = await Onboarding(finalGoal, formData.skill_level, formData.custom_goal);
      if (success) {
        toast.success("Welcome to AcadexAI! 🎉");
        navigate("/dashboard");
      } else {
        toast.error("Onboarding process incomplete");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.learning_goal || formData.custom_goal.trim();
      case 2: return formData.skill_level;
      case 3: return formData.study_time && formData.learning_style;
      case 4: return formData.motivation;
      default: return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <GraduationCap className="w-10 h-10 text-green-400" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-green-400">Welcome to AcadexAI! 🎓</h2>
              <p className="text-gray-300 text-lg max-w-md mx-auto">
                We're excited to help you on your learning journey. Let's personalize your experience in just a few steps.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <BookOpen className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-300">Personalized Quizzes</p>
                </div>
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-300">Goal Tracking</p>
                </div>
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <Trophy className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-300">Progress Insights</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Target className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-green-400">What's your learning goal?</h2>
              <p className="text-gray-400 mt-2">Choose what you'd like to focus on, or tell us something specific</p>
            </div>
            
            <RadioGroup 
              value={formData.learning_goal} 
              onValueChange={(value) => updateFormData('learning_goal', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                <RadioGroupItem value="coding" id="coding" />
                <Code className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                  <Label htmlFor="coding" className="text-gray-200 font-medium">Learn Programming & Development</Label>
                  <p className="text-sm text-gray-400">Master coding languages, frameworks, and best practices</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                <RadioGroupItem value="exam-prep" id="exam-prep" />
                <BookOpen className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                  <Label htmlFor="exam-prep" className="text-gray-200 font-medium">Prepare for Exams & Certifications</Label>
                  <p className="text-sm text-gray-400">Get ready for academic or professional examinations</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                <RadioGroupItem value="english" id="english" />
                <Globe className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                  <Label htmlFor="english" className="text-gray-200 font-medium">Improve Language Skills</Label>
                  <p className="text-sm text-gray-400">Enhance vocabulary, grammar, and communication</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                <RadioGroupItem value="general-knowledge" id="general-knowledge" />
                <GraduationCap className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                  <Label htmlFor="general-knowledge" className="text-gray-200 font-medium">Expand General Knowledge</Label>
                  <p className="text-sm text-gray-400">Explore various subjects and broaden your understanding</p>
                </div>
              </div>
            </RadioGroup>

            <div className="pt-4 border-t border-gray-600">
              <Label className="text-gray-200 mb-2 block">Or tell us your specific goal:</Label>
              <Input
                placeholder="e.g., Learn React for web development, Master calculus for engineering..."
                value={formData.custom_goal}
                onChange={(e) => updateFormData('custom_goal', e.target.value)}
                className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Trophy className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-green-400">What's your current level?</h2>
              <p className="text-gray-400 mt-2">This helps us tailor content to your experience</p>
            </div>

            <RadioGroup 
              value={formData.skill_level} 
              onValueChange={(value) => updateFormData('skill_level', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                <RadioGroupItem value="beginner" id="beginner" />
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <Label htmlFor="beginner" className="text-gray-200 font-medium">Beginner</Label>
                  <p className="text-sm text-gray-400">Just starting out or have minimal experience</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                <RadioGroupItem value="intermediate" id="intermediate" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <Label htmlFor="intermediate" className="text-gray-200 font-medium">Intermediate</Label>
                  <p className="text-sm text-gray-400">Have some knowledge and want to build upon it</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                <RadioGroupItem value="advanced" id="advanced" />
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="flex-1">
                  <Label htmlFor="advanced" className="text-gray-200 font-medium">Advanced</Label>
                  <p className="text-sm text-gray-400">Experienced and looking to master advanced concepts</p>
                </div>
              </div>
            </RadioGroup>

            <div className="pt-4 border-t border-gray-600">
              <Label className="text-gray-200 mb-2 block">Years of experience (optional):</Label>
              <Input
                placeholder="e.g., 2 years, 6 months, etc."
                value={formData.experience_years}
                onChange={(e) => updateFormData('experience_years', e.target.value)}
                className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Clock className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-green-400">How do you prefer to learn?</h2>
              <p className="text-gray-400 mt-2">Let's customize your learning experience</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-gray-200 mb-3 block font-medium">How much time can you dedicate daily?</Label>
                <RadioGroup 
                  value={formData.study_time} 
                  onValueChange={(value) => updateFormData('study_time', value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="15-min" id="15-min" />
                    <Label htmlFor="15-min" className="text-gray-300">15-30 minutes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="30-min" id="30-min" />
                    <Label htmlFor="30-min" className="text-gray-300">30-60 minutes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1-hour" id="1-hour" />
                    <Label htmlFor="1-hour" className="text-gray-300">1-2 hours</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2-plus-hours" id="2-plus-hours" />
                    <Label htmlFor="2-plus-hours" className="text-gray-300">2+ hours</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-gray-200 mb-3 block font-medium">What's your preferred learning style?</Label>
                <RadioGroup 
                  value={formData.learning_style} 
                  onValueChange={(value) => updateFormData('learning_style', value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="visual" id="visual" />
                    <Label htmlFor="visual" className="text-gray-300">Visual (diagrams, charts, images)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="reading" id="reading" />
                    <Label htmlFor="reading" className="text-gray-300">Reading/Writing (text-based)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="interactive" id="interactive" />
                    <Label htmlFor="interactive" className="text-gray-300">Interactive (quizzes, hands-on)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mixed" id="mixed" />
                    <Label htmlFor="mixed" className="text-gray-300">Mixed approach</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-gray-200 mb-3 block font-medium">Timeline for your goals:</Label>
                <RadioGroup 
                  value={formData.goals_timeline} 
                  onValueChange={(value) => updateFormData('goals_timeline', value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1-month" id="1-month" />
                    <Label htmlFor="1-month" className="text-gray-300">1 month</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3-months" id="3-months" />
                    <Label htmlFor="3-months" className="text-gray-300">3 months</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="6-months" id="6-months" />
                    <Label htmlFor="6-months" className="text-gray-300">6 months</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1-year" id="1-year" />
                    <Label htmlFor="1-year" className="text-gray-300">1 year or more</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Sparkles className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-green-400">What motivates you?</h2>
              <p className="text-gray-400 mt-2">Understanding your motivation helps us keep you engaged</p>
            </div>

            <RadioGroup 
              value={formData.motivation} 
              onValueChange={(value) => updateFormData('motivation', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                <RadioGroupItem value="career" id="career" />
                <div className="flex-1">
                  <Label htmlFor="career" className="text-gray-200 font-medium">Career Advancement</Label>
                  <p className="text-sm text-gray-400">Want to get promoted or switch careers</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                <RadioGroupItem value="academic" id="academic" />
                <div className="flex-1">
                  <Label htmlFor="academic" className="text-gray-200 font-medium">Academic Success</Label>
                  <p className="text-sm text-gray-400">Improving grades or passing exams</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                <RadioGroupItem value="personal" id="personal" />
                <div className="flex-1">
                  <Label htmlFor="personal" className="text-gray-200 font-medium">Personal Growth</Label>
                  <p className="text-sm text-gray-400">Love learning and expanding knowledge</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                <RadioGroupItem value="hobby" id="hobby" />
                <div className="flex-1">
                  <Label htmlFor="hobby" className="text-gray-200 font-medium">Hobby & Interest</Label>
                  <p className="text-sm text-gray-400">Learning for fun and personal interest</p>
                </div>
              </div>
            </RadioGroup>

            <div className="pt-6 text-center bg-gray-700/20 rounded-lg p-6">
              <h3 className="text-lg font-medium text-green-400 mb-2">Ready to start your journey? 🚀</h3>
              <p className="text-gray-400 text-sm">
                We'll use this information to create personalized quizzes and track your progress.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-gray-900 to-black p-6">
      <Card className="bg-gray-800/90 border border-gray-700 shadow-xl rounded-2xl w-full max-w-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={index}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      index <= currentStep 
                        ? 'bg-green-500 text-black' 
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>
                );
              })}
            </div>
            <div className="text-sm text-gray-400">
              {currentStep + 1} of {steps.length}
            </div>
          </div>
          
          <Progress value={progressPercentage} className="h-2 mb-4" />
          
          <div className="text-center">
            <CardTitle className="text-xl text-green-400">
              {steps[currentStep].title}
            </CardTitle>
            <p className="text-sm text-gray-400 mt-1">
              {steps[currentStep].description}
            </p>
          </div>
        </CardHeader>

        <CardContent className="min-h-[400px]">
          {renderStepContent()}
          
          <div className="flex justify-between pt-8 border-t border-gray-600 mt-8">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-green-500 hover:bg-green-600 text-black font-medium"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
                className="bg-green-500 hover:bg-green-600 text-black font-bold px-8"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    Start Learning
                    <Sparkles className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}