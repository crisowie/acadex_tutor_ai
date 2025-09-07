import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "@/config/supabaseClient"; // your Supabase client
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [learning_goal, setGoal] = useState("");
  const [skill_level, setLevel] = useState("");
  const [custom_goal, setCustomGoal] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const {user,Onboarding} = useAuth()
  // 🚀 Skip if user already onboarded
  useEffect(() => {
    const checkProfile = async () => {
      if (user?.learning_goal && user?.skill_level) {
        navigate("/dashboard", { replace: true });
      }
    };
    checkProfile();
  }, [navigate]);

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const success = await Onboarding(learning_goal,skill_level,custom_goal)
      if (success) {
        toast.success("Welcome to AcadexAI") 
          navigate("/dashboard"); // Redirect to dashboard
          console.log(success)
      }else{
        toast.error("Onboarding process Incomplete")
      }
    } catch (error) {
      console.log(error)
    }finally{
      setLoading(false)
    }

  };

  return (
    <form onSubmit={handleSubmit}>
         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-gray-900 to-black p-6">
      <Card className="bg-gray-800/90 border border-gray-700 shadow-xl rounded-2xl w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-green-400">
            Welcome to Acadex AI 🎓
          </CardTitle>
          <p className="text-sm text-gray-400 text-center">
            Let’s personalize your learning journey
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* === Goal === */}
          <div>
            <Label className="text-gray-200 mb-2 block">What do you want to learn?</Label>
            <RadioGroup value={learning_goal} onValueChange={setGoal} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="coding" id="coding" />
                <Label htmlFor="coding" className="text-gray-300">Learn Coding</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="exam-prep" id="exam-prep" />
                <Label htmlFor="exam-prep" className="text-gray-300">Prepare for Exams</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="english" id="english" />
                <Label htmlFor="english" className="text-gray-300">Improve English</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="history" id="history" />
                <Label htmlFor="history" className="text-gray-300">Explore History</Label>
              </div>
            </RadioGroup>
            <Input
              placeholder="Or type your own goal..."
              value={custom_goal}
              onChange={(e) => setCustomGoal(e.target.value)}
              className="mt-3 bg-gray-700 border-gray-600 text-gray-100"
            />
          </div>

          {/* === Level === */}
          <div>
            <Label className="text-gray-200 mb-2 block">Your skill level</Label>
            <RadioGroup value={skill_level} onValueChange={setLevel} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="beginner" id="beginner" />
                <Label htmlFor="beginner" className="text-gray-300">Beginner</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediate" id="intermediate" />
                <Label htmlFor="intermediate" className="text-gray-300">Intermediate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="advanced" id="advanced" />
                <Label htmlFor="advanced" className="text-gray-300">Advanced</Label>
          b    </div>
            </RadioGroup>
          </div>

          {/* === Error === */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* === CTA === */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-2 rounded-xl transition"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5"/> : "Start Learning 🚀"}
          </Button>
        </CardContent>
      </Card>
    </div>
    </form>
 
  );
}
