import React, { useState } from 'react';
import { Search, Plus, Users, BookOpen, MessageCircle, TrendingUp, Star, Lock, Globe, Filter, Grid, List, Award, Target, Clock, Trophy } from 'lucide-react';
import { groupsData } from "../types/index"
import { stats } from '../types/index';

const Community = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    privacy: 'public',
    rules: ''
  });



  const subjects = ['all', 'Computer Science', 'Mathematics', 'Biology', 'Physics', 'Literature', 'Chemistry', 'Business', 'Engineering'];

  // Statistics for dashboard-style header


  const filteredGroups = groupsData.filter(group => {
    const matchesSearch = group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = activeFilter === 'all' || group.subject === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getActivityColor = (activity) => {
    switch (activity) {
      case 'very-high': return 'bg-green-500';
      case 'high': return 'bg-blue-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityText = (activity) => {
    switch (activity) {
      case 'very-high': return 'Very Active';
      case 'high': return 'Active';
      case 'medium': return 'Moderate';
      default: return 'Low';
    }
  };

  const handleCreateGroup = () => {
    console.log('Creating group:', formData);
    setShowCreateModal(false);
    setFormData({
      title: '',
      description: '',
      subject: '',
      privacy: 'public',
      rules: ''
    });
  };

  const joinGroup = (groupId) => {
    console.log(`Joining group ${groupId}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="px-2 py-3 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Community Groups</h1>
              <p className="text-muted-foreground">
                Connect, collaborate, and learn together
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Create Group
            </button>
          </div>
        </div>

        {/* Stats Grid - Dashboard Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="bg-card border border-border rounded-lg p-6 relative overflow-hidden">
                <div className="pb-2">
                  <div className="flex items-center justify-between">
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                    <div className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                      {stat.change}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search communities, topics, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            {subjects.map(subject => (
              <button
                key={subject}
                onClick={() => setActiveFilter(subject)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === subject
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
              >
                {subject === 'all' ? 'All Subjects' : subject}
              </button>
            ))}
          </div>
        </div>

        {/* Groups Grid/List */}
        {/* Groups Feed */}
        <div className="space-y-4">
          {filteredGroups.map(group => (
            <div
              key={group.id}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Left: Avatar + Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-4xl">{group.avatar}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-foreground">{group.title}</h3>
                      {group.trending && (
                        <span className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                          <TrendingUp size={12} /> Trending
                        </span>
                      )}
                      {group.privacy === "private" ? (
                        <Lock size={14} className="text-muted-foreground" />
                      ) : (
                        <Globe size={14} className="text-green-400" />
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">
                      {group.description}
                    </p>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users size={14} /> {group.members.toLocaleString()} members
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={14} /> {group.posts} posts
                      </span>
                      <span className="text-green-400 font-medium">
                        {group.online} online
                      </span>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getActivityColor(group.activity)}`}></div>
                        <span>{getActivityText(group.activity)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Join Button */}
                <button
                  onClick={() => joinGroup(group.id)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors self-start md:self-center"
                >
                  Join
                </button>
              </div>
            </div>
          ))}
        </div>


        {/* Empty State */}
        {filteredGroups.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-16 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No communities found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Try adjusting your search terms or create a new community for others to join
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Create New Community
            </button>
          </div>
        )}

        {/* Quick Actions - Dashboard Style */}
        <div className="bg-card border border-border rounded-lg">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Community Highlights
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Most Active</span>
                </div>
                <p className="text-2xl font-bold text-primary">Software Engineering</p>
                <p className="text-xs text-muted-foreground">445 posts this week</p>
              </div>

              <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-medium text-foreground">Trending Topic</span>
                </div>
                <p className="text-2xl font-bold text-orange-400">AI & Machine Learning</p>
                <p className="text-xs text-muted-foreground">3.2K members joined</p>
              </div>

              <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium text-foreground">Largest Community</span>
                </div>
                <p className="text-2xl font-bold text-purple-400">4.3K</p>
                <p className="text-xs text-muted-foreground">Software Engineering</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Create New Community</h2>
                  <p className="text-muted-foreground mt-1">Build a space for learning and collaboration</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <div className="w-6 h-6 flex items-center justify-center text-xl font-bold">×</div>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">Community Name *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="e.g., Advanced Machine Learning"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">Subject Area *</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    >
                      <option value="">Select subject</option>
                      {subjects.filter(s => s !== 'all').map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    rows={4}
                    placeholder="Describe what your community is about, what topics you'll discuss, and what members can expect..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Community Privacy</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      onClick={() => setFormData({ ...formData, privacy: 'public' })}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${formData.privacy === 'public'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                        }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Globe className="text-green-400" size={20} />
                        <span className="font-medium text-foreground">Public</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Anyone can discover and join this community</p>
                    </div>

                    <div
                      onClick={() => setFormData({ ...formData, privacy: 'private' })}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${formData.privacy === 'private'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                        }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Lock className="text-orange-400" size={20} />
                        <span className="font-medium text-foreground">Private</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Invite-only community with restricted access</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Community Guidelines (Optional)</label>
                  <textarea
                    value={formData.rules}
                    onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-all transition-all"
                    rows={3}
                    placeholder="Set some ground rules to keep discussions respectful and on-topic..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 border border-border text-muted-foreground rounded-lg hover:bg-muted hover:text-foreground font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateGroup}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Create Community
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community