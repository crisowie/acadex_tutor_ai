import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Trophy, 
  Star, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Calendar,
  Target,
  Zap,
  Award,
  TrendingUp,
  Clock,
  Brain,
  Lightbulb,
  Crown,
  Flame,
  Edit3,
  MapPin,
  Link,
  Shield,
  Mail,
  Camera
} from 'lucide-react';

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  // Mock user data
  const user = {
    name: "Sarah Chen",
    username: "sarahlearns",
    email: "sarah.chen@example.com",
    bio: "Computer Science student passionate about AI and machine learning. Always eager to learn something new!",
    location: "San Francisco, CA",
    website: "sarahchen.dev",
    joinDate: "January 2024",
    avatar: null,
    plan: "Premium",
    streak: 47,
    totalPoints: 3850,
    level: 18,
    nextLevelPoints: 4200,
    followers: 245,
    following: 89,
    studyGroups: 12
  };

  const achievements = [
    { name: "First Question", description: "Asked your very first question", icon: MessageSquare, unlocked: true, rarity: "common", date: "Jan 15, 2024" },
    { name: "Week Warrior", description: "Maintained 7-day study streak", icon: Flame, unlocked: true, rarity: "uncommon", date: "Jan 28, 2024" },
    { name: "Century Club", description: "Asked 100+ questions", icon: Brain, unlocked: true, rarity: "rare", date: "Feb 12, 2024" },
    { name: "Group Leader", description: "Created and managed a study group", icon: Users, unlocked: true, rarity: "rare", date: "Feb 20, 2024" },
    { name: "Quiz Champion", description: "Perfect score on 10 quizzes", icon: Trophy, unlocked: true, rarity: "epic", date: "Mar 05, 2024" },
    { name: "Knowledge Vault", description: "Bookmarked 50+ resources", icon: BookOpen, unlocked: false, rarity: "epic", progress: 34 },
    { name: "Community Star", description: "Top contributor this month", icon: Star, unlocked: false, rarity: "legendary", progress: 0 },
    { name: "AI Pioneer", description: "Early adopter of new features", icon: Lightbulb, unlocked: true, rarity: "special", date: "Mar 01, 2024" }
  ];

  const stats = [
    { label: "Total Questions", value: "312", change: "+12", trend: "up" },
    { label: "Quiz Score Avg", value: "87%", change: "+5%", trend: "up" },
    { label: "Study Groups", value: "12", change: "+2", trend: "up" },
    { label: "Hours Learned", value: "156h", change: "+8h", trend: "up" }
  ];

  const recentActivity = [
    { type: "achievement", title: "Earned Quiz Champion badge", time: "2 hours ago", points: 150 },
    { type: "group", title: "Joined React Developers group", time: "5 hours ago", points: 25 },
    { type: "question", title: "Asked about async/await in JavaScript", time: "1 day ago", points: 15 },
    { type: "quiz", title: "Completed Python Basics Quiz", time: "2 days ago", points: 80 },
    { type: "bookmark", title: "Bookmarked Machine Learning guide", time: "3 days ago", points: 10 }
  ];

  const getBadgeStyle = (rarity, unlocked) => {
    const rarityColors = {
      common: unlocked ? 'from-slate-400 to-slate-600' : 'from-slate-300 to-slate-400',
      uncommon: unlocked ? 'from-green-400 to-green-600' : 'from-green-300 to-green-400',
      rare: unlocked ? 'from-blue-400 to-blue-600' : 'from-blue-300 to-blue-400',
      epic: unlocked ? 'from-purple-400 to-purple-600' : 'from-purple-300 to-purple-400',
      legendary: unlocked ? 'from-yellow-400 to-orange-500' : 'from-yellow-300 to-orange-300',
      special: unlocked ? 'from-pink-400 to-rose-500' : 'from-pink-300 to-rose-300'
    };
    return rarityColors[rarity] || rarityColors.common;
  };

  const progressPercentage = ((user.totalPoints % (user.nextLevelPoints - (user.level - 1) * 200)) / (user.nextLevelPoints - (user.level - 1) * 200)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Profile Header */}
        <div className="relative mb-8">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-cyan-600/10 to-violet-600/10 rounded-3xl"></div>
          
          <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800/50 overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Avatar and Basic Info */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="relative group">
                    <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 via-cyan-500 to-violet-500 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <button className="absolute inset-0 bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </button>
                    <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg border-4 border-slate-900">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="text-center sm:text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-4xl font-bold text-white">{user.name}</h1>
                      <button className="text-slate-400 hover:text-white transition-colors">
                        <Edit3 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-emerald-400 text-lg mb-3">@{user.username}</p>
                    <p className="text-slate-300 mb-4 max-w-md leading-relaxed">{user.bio}</p>
                    
                    <div className="flex flex-wrap gap-4 text-slate-400 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {user.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Link className="w-4 h-4" />
                        {user.website}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Joined {user.joinDate}
                      </div>
                    </div>
                    
                    <div className="flex gap-6 mt-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">{user.followers}</div>
                        <div className="text-slate-400 text-sm">Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">{user.following}</div>
                        <div className="text-slate-400 text-sm">Following</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">{user.studyGroups}</div>
                        <div className="text-slate-400 text-sm">Groups</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Level and Progress */}
                <div className="flex-1 lg:max-w-md">
                  <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">Level {user.level}</div>
                          <div className="text-slate-400 text-sm">{user.totalPoints} XP</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-emerald-400">{user.streak}</div>
                        <div className="text-slate-400 text-sm flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-500" />
                          day streak
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Progress to Level {user.level + 1}</span>
                        <span className="text-slate-300">{Math.round(progressPercentage)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-slate-400 text-xs">
                        {user.nextLevelPoints - user.totalPoints} XP to next level
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-slate-900/50 p-2 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'achievements', label: 'Achievements', icon: Trophy },
            { id: 'stats', label: 'Statistics', icon: TrendingUp },
            { id: 'activity', label: 'Activity', icon: Clock },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50">
                      <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-slate-400 text-sm mb-2">{stat.label}</div>
                      <div className="flex items-center gap-1 text-emerald-400 text-xs">
                        <TrendingUp className="w-3 h-3" />
                        {stat.change}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Achievements */}
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Award className="w-6 h-6 text-emerald-400" />
                    Recent Achievements
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.slice(0, 6).filter(achievement => achievement.unlocked).map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getBadgeStyle(achievement.rarity, true)} flex items-center justify-center shadow-lg`}>
                          <achievement.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-white text-sm">{achievement.name}</div>
                          <div className="text-slate-400 text-xs">{achievement.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Activity Feed */}
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-emerald-400" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/30 transition-colors">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-300 text-sm font-medium">{activity.title}</p>
                        <p className="text-slate-500 text-xs">{activity.time}</p>
                      </div>
                      <span className="text-emerald-400 text-sm font-medium">+{activity.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {achievements.map((achievement, index) => (
                <div 
                  key={index}
                  className={`relative bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border transition-all hover:scale-105 ${
                    achievement.unlocked 
                      ? 'border-slate-700/50 hover:border-slate-600/50 shadow-lg' 
                      : 'border-slate-800/30 opacity-70'
                  }`}
                >
                  <div className="text-center space-y-4">
                    <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${getBadgeStyle(achievement.rarity, achievement.unlocked)} flex items-center justify-center shadow-xl ${!achievement.unlocked ? 'grayscale' : ''}`}>
                      <achievement.icon className="w-10 h-10 text-white" />
                    </div>
                    
                    <div>
                      <h4 className="text-white font-bold text-lg mb-2">{achievement.name}</h4>
                      <p className="text-slate-400 text-sm mb-4">{achievement.description}</p>
                      
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        achievement.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30' :
                        achievement.rarity === 'epic' ? 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-400 border border-purple-500/30' :
                        achievement.rarity === 'rare' ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 border border-blue-500/30' :
                        achievement.rarity === 'uncommon' ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-500/30' :
                        achievement.rarity === 'special' ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-400 border border-pink-500/30' :
                        'bg-gradient-to-r from-slate-500/20 to-slate-600/20 text-slate-400 border border-slate-500/30'
                      }`}>
                        {achievement.rarity}
                      </div>
                      
                      {achievement.unlocked && achievement.date && (
                        <div className="text-slate-500 text-xs mt-2">Earned {achievement.date}</div>
                      )}
                      
                      {!achievement.unlocked && achievement.progress !== undefined && (
                        <div className="mt-3">
                          <div className="w-full bg-slate-800 rounded-full h-2">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all"
                              style={{ width: `${(achievement.progress / 50) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-slate-400 text-xs mt-1">{achievement.progress}/50</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {!achievement.unlocked && achievement.progress === undefined && (
                    <div className="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center">
                      <div className="w-12 h-12 border-2 border-slate-600 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-slate-500 rounded-full"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl">
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-800/50">
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-emerald-400" />
                  Account Settings
                </h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-300 font-medium mb-2">Display Name</label>
                      <input 
                        type="text" 
                        defaultValue={user.name}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-slate-300 font-medium mb-2">Username</label>
                      <input 
                        type="text" 
                        defaultValue={user.username}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-slate-300 font-medium mb-2">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue={user.email}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-slate-300 font-medium mb-2">Bio</label>
                    <textarea 
                      rows={3}
                      defaultValue={user.bio}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-300 font-medium mb-2">Location</label>
                      <input 
                        type="text" 
                        defaultValue={user.location}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-slate-300 font-medium mb-2">Website</label>
                      <input 
                        type="url" 
                        defaultValue={user.website}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-medium px-8 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-emerald-600/25">
                      Save Changes
                    </button>
                    <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-8 py-3 rounded-xl transition-colors border border-slate-700">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;