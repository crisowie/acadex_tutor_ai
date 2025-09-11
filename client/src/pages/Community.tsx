import React, { useState } from 'react';
import { Search, Users, MessageCircle, TrendingUp, Lock, Globe, ChevronRight, Crown, Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { groupsData } from "../types/index"

const Community = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const subjects = ['all', 'Computer Science', 'Mathematics', 'Biology', 'Physics', 'Literature', 'Chemistry', 'Business', 'Engineering'];

  // Mock joined communities data
  const joinedCommunities = [
    { id: 1, name: 'Software Engineering', members: 4200, avatar: '💻', isOwner: true },
    { id: 2, name: 'Machine Learning', members: 3800, avatar: '🤖', isOwner: false },
    { id: 3, name: 'Web Development', members: 2900, avatar: '🌐', isOwner: false },
    { id: 4, name: 'Data Science', members: 2100, avatar: '📊', isOwner: false },
    { id: 5, name: 'Mobile Development', members: 1800, avatar: '📱', isOwner: false },
  ];

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
      case 'medium': return 'bg-orange-500';
      default: return 'bg-muted';
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

  const joinGroup = (groupId: number) => {
    console.log(`Joining group ${groupId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-2 py-3 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Community Groups</h1>
          <p className="text-muted-foreground">
            Connect, collaborate, and learn together
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-4">
                  {/* Search */}
                  <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                    <input
                      type="text"
                      placeholder="Search communities, topics, or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap gap-2">
                    {subjects.map(subject => (
                      <button
                        key={subject}
                        onClick={() => setActiveFilter(subject)}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                          activeFilter === subject
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        }`}
                      >
                        {subject === 'all' ? 'All' : subject}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Communities Feed */}
            <div className="space-y-4">
              {filteredGroups.map(group => (
                <Card key={group.id} className="hover:border-primary/50 transition-all">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Avatar and Info */}
                      <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="text-2xl sm:text-4xl bg-muted p-2 sm:p-3 rounded-lg flex-shrink-0">
                          {group.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="text-lg sm:text-xl font-bold text-foreground truncate">
                              {group.title}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              {group.trending && (
                                <Badge variant="secondary" className="text-xs">
                                  <TrendingUp size={12} className="mr-1" />
                                  Trending
                                </Badge>
                              )}
                              <div className="flex items-center gap-1 text-xs">
                                {group.privacy === "private" ? (
                                  <>
                                    <Lock size={12} className="text-muted-foreground" />
                                    <span className="text-muted-foreground">Private</span>
                                  </>
                                ) : (
                                  <>
                                    <Globe size={12} className="text-green-500" />
                                    <span className="text-green-500">Public</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                            {group.description}
                          </p>

                          {/* Meta */}
                          <div className="flex flex-wrap gap-3 sm:gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users size={12} /> 
                              {group.members.toLocaleString()} members
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle size={12} /> 
                              {group.posts} posts
                            </span>
                            <span className="text-green-500 font-medium">
                              {group.online} online
                            </span>
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${getActivityColor(group.activity)}`}></div>
                              <span>{getActivityText(group.activity)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Join Button */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:flex-col sm:items-end">
                        <button
                          onClick={() => joinGroup(group.id)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 sm:px-6 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
                        >
                          Join
                        </button>
                        <ChevronRight className="text-muted-foreground hidden sm:block" size={20} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredGroups.length === 0 && (
              <Card>
                <CardContent className="p-8 sm:p-16 text-center">
                  <div className="text-4xl sm:text-6xl mb-4">🔍</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">No communities found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm sm:text-base">
                    Try adjusting your search terms or browse different categories
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Your Communities */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-foreground">Your Communities</h3>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {joinedCommunities.map((community, index) => (
                    <div
                      key={community.id}
                      className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                        index !== joinedCommunities.length - 1 ? 'border-b border-border' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-lg bg-muted p-2 rounded-lg">
                          {community.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground text-sm truncate">
                              {community.name}
                            </h4>
                            {community.isOwner && (
                              <Crown size={12} className="text-orange-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {community.members > 1000 
                              ? `${(community.members / 1000).toFixed(1)}k` 
                              : community.members.toLocaleString()
                            } members
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Communities */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-foreground">Popular Communities</h3>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {groupsData.slice(0, 5).map((community, index) => (
                    <div
                      key={community.id}
                      className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                        index !== 4 ? 'border-b border-border' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-lg bg-muted p-2 rounded-lg">
                          {community.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground text-sm truncate">
                            {community.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {community.members > 1000 
                              ? `${(community.members / 1000).toFixed(1)}k` 
                              : community.members.toLocaleString()
                            } members
                          </p>
                        </div>
                        <button
                          onClick={() => joinGroup(community.id)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 rounded text-xs font-medium transition-colors"
                        >
                          Join
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-primary">{joinedCommunities.length}</div>
                  <p className="text-sm text-muted-foreground">Communities Joined</p>
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-orange-500" />
                      <span>1 Owner</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={12} className="text-blue-500" />
                      <span>{joinedCommunities.length - 1} Member</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;