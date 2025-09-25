import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  Calendar,
  Plus,
  Globe,
  Lock,
  Eye,
  ArrowLeft,
  ArrowRight,
  Star,
  TrendingUp,
  MessageSquare,
  X,
  Upload,
  Camera,
} from "lucide-react";

export default function Community() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    community_name: "",
    description: "",
    type: "public",
    topics: [],
    isNSFW: false,
    isPolicy: false,
    logo: null,
    logoPreview: "",
  });

  // Mock communities data
  const [communities] = useState([
    {
      id: "1",
      name: "r/programming",
      description: "Computer Programming - The art and science of writing software",
      members: 4200000,
      type: "public",
      topics: ["Technology", "Programming"],
      isNSFW: false,
      created_at: "2023-01-15",
      posts_today: 234,
      trending: true,
      logo: "https://via.placeholder.com/40x40/0066cc/ffffff?text=P"
    },
    {
      id: "2", 
      name: "r/webdev",
      description: "A community dedicated to all things web development",
      members: 890000,
      type: "public",
      topics: ["Technology", "Web Development"],
      isNSFW: false,
      created_at: "2023-03-20",
      posts_today: 156,
      trending: false,
      logo: "https://via.placeholder.com/40x40/00cc66/ffffff?text=W"
    },
    {
      id: "3",
      name: "r/reactjs",
      description: "A community for learning and developing with React",
      members: 310000,
      type: "public", 
      topics: ["Technology", "JavaScript", "React"],
      isNSFW: false,
      created_at: "2023-02-10",
      posts_today: 87,
      trending: true,
      logo: "https://via.placeholder.com/40x40/61dafb/000000?text=R"
    },
    {
      id: "4",
      name: "r/privacy",
      description: "The intersection of technology, privacy, and freedom",
      members: 1200000,
      type: "restricted",
      topics: ["Privacy", "Technology"],
      isNSFW: false,
      created_at: "2022-11-05",
      posts_today: 45,
      trending: false,
      logo: "https://via.placeholder.com/40x40/cc6600/ffffff?text=Pr"
    },
  ]);

  const filteredCommunities = communities.filter((community) => {
    return (
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.topics.some(topic => 
        topic.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });

  const formatMemberCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "public":
        return <Globe className="h-4 w-4" />;
      case "restricted":
        return <Lock className="h-4 w-4" />;
      case "private":
        return <Eye className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "public":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "restricted":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "private":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const handleJoinCommunity = (communityId) => {
    console.log("Joining community:", communityId);
    // Handle join logic here
  };

  // Logo upload handler
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file (JPG, PNG, GIF)");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          logo: file,
          logoPreview: typeof e.target.result === "string" ? e.target.result : ""
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove logo
  const removeLogo = () => {
    setFormData(prev => ({
      ...prev,
      logo: null,
      logoPreview: ""
    }));
    // Reset file input
    const fileInput = document.getElementById('logo-upload') as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleCreateCommunity = () => {
    console.log("Creating community:", formData);
    // Reset form and close dialog
    setShowCreateDialog(false);
    setCurrentStep(1);
    setFormData({
      community_name: "",
      description: "",
      type: "public",
      topics: [],
      isNSFW: false,
      isPolicy: false,
      logo: null,
      logoPreview: "",
    });
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Community Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Community name</label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-muted text-muted-foreground border border-r-0 rounded-l-md text-sm">
                  r/
                </span>
                <Input
                  value={formData.community_name}
                  onChange={(e) => setFormData({...formData, community_name: e.target.value})}
                  className="rounded-l-none border-l-0"
                  placeholder="community_name"
                  maxLength={21}
                />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {21 - formData.community_name.length} characters remaining
              </p>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium mb-3">Community logo (optional)</label>
              <div className="flex items-center gap-4">
                {/* Logo Preview */}
                <div className="relative">
                  {formData.logoPreview ? (
                    <div className="relative group">
                      <img 
                        src={formData.logoPreview} 
                        alt="Community logo preview" 
                        className="w-20 h-20 rounded-full object-cover border-2 border-border shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-lg hover:bg-destructive/90 transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/50 hover:bg-muted/70 transition-colors">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-input rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-ring"
                  >
                    <Upload className="h-4 w-4" />
                    {formData.logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </label>
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    <p>Recommended: Square image, at least 256x256 pixels</p>
                    <p>Supported formats: JPG, PNG, GIF (max 5MB)</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Community Type */}
            <div>
              <label className="block text-sm font-medium mb-3">Community type</label>
              <div className="space-y-4">
                {[
                  { 
                    value: "public", 
                    icon: <Globe className="h-4 w-4" />, 
                    title: "Public",
                    description: "Anyone can view, post, and comment to this community"
                  },
                  { 
                    value: "restricted", 
                    icon: <Lock className="h-4 w-4" />, 
                    title: "Restricted",
                    description: "Anyone can view this community, but only approved users can post"
                  },
                  { 
                    value: "private", 
                    icon: <Eye className="h-4 w-4" />, 
                    title: "Private",
                    description: "Only approved users can view and submit to this community"
                  }
                ].map((option) => (
                  <div key={option.value} className="flex items-start space-x-3">
                    <input
                      type="radio"
                      id={option.value}
                      name="type"
                      value={option.value}
                      checked={formData.type === option.value}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-1">
                      <label htmlFor={option.value} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                        {option.icon}
                        {option.title}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* NSFW Checkbox */}
            <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
              <input
                type="checkbox"
                id="nsfw"
                checked={formData.isNSFW}
                onChange={(e) => setFormData({...formData, isNSFW: e.target.checked})}
                className="rounded"
              />
              <label htmlFor="nsfw" className="text-sm cursor-pointer flex-1">
                <span className="font-medium">18+ year old community</span>
                <p className="text-xs text-muted-foreground mt-1">
                  This community contains mature content
                </p>
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Tell people what your community is about..."
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none bg-background min-h-[100px]"
                rows={4}
                maxLength={500}
              />
              <p className="mt-1 text-sm text-muted-foreground">
                {500 - formData.description.length} characters remaining
              </p>
            </div>

            {/* Topics */}
            <div>
              <label className="block text-sm font-medium mb-2">Topics (optional)</label>
              <p className="text-sm text-muted-foreground mb-3">
                Add up to 5 topics to help people discover your community
              </p>
              <Input
                placeholder="Type a topic and press Enter..."
                onKeyPress={(e) => {
                  const input = e.target as HTMLInputElement;
                  if (e.key === 'Enter' && input.value.trim()) {
                    e.preventDefault();
                    if (formData.topics.length < 5 && !formData.topics.includes(input.value.trim())) {
                      setFormData({
                        ...formData,
                        topics: [...formData.topics, input.value.trim()]
                      });
                      input.value = '';
                    }
                  }
                }}
              />
              {formData.topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.topics.map((topic, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          topics: formData.topics.filter((_, i) => i !== index)
                        });
                      }}
                    >
                      {topic} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {formData.topics.length}/5 topics added
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Review your community</h3>
            
            {/* Community Preview */}
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-4 mb-4">
                {formData.logoPreview ? (
                  <img 
                    src={formData.logoPreview} 
                    alt="Community logo" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-border shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div>
                  <h4 className="text-xl font-bold text-primary">r/{formData.community_name}</h4>
                  <Badge className={getTypeColor(formData.type)}>
                    <span className="flex items-center gap-1">
                      {getTypeIcon(formData.type)}
                      {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
                    </span>
                  </Badge>
                </div>
              </div>

              {formData.description && (
                <div className="mb-4">
                  <h5 className="font-medium mb-2">Description:</h5>
                  <p className="text-sm text-muted-foreground bg-background p-3 rounded border">
                    {formData.description}
                  </p>
                </div>
              )}

              {formData.topics.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-medium mb-2">Topics:</h5>
                  <div className="flex flex-wrap gap-2">
                    {formData.topics.map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {formData.isNSFW && (
                <div>
                  <Badge variant="destructive" className="text-xs">
                    18+ Community
                  </Badge>
                </div>
              )}
            </div>

            {/* Policy Agreement */}
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="policy"
                  required
                  checked={formData.isPolicy}
                  onChange={(e) => setFormData({...formData, isPolicy: e.target.checked})}
                  className="mt-1"
                />
                <label htmlFor="policy" className="text-sm cursor-pointer">
                  <span className="font-medium">Terms and Conditions</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    By creating this community, you agree to Acaadex's Community Guidelines and Content Policy. 
                    You will be responsible for moderating your community according to these guidelines.
                  </p>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Communities</h1>
            <p className="text-muted-foreground">
              Discover and join communities of your interest
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{communities.length} communities</span>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Community
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search communities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">12</p>
            <p className="text-sm text-muted-foreground">Joined Communities</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {communities.filter(c => c.trending).length}
            </p>
            <p className="text-sm text-muted-foreground">Trending Now</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">47</p>
            <p className="text-sm text-muted-foreground">New Posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">3</p>
            <p className="text-sm text-muted-foreground">My Communities</p>
          </CardContent>
        </Card>
      </div>

      {/* Communities List */}
      <div className="space-y-4">
        {filteredCommunities.map((community) => (
          <Card
            key={community.id}
            className="hover:shadow-lg transition-all duration-200"
          >
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-shrink-0">
                  {community.logo ? (
                    <img 
                      src={community.logo} 
                      alt={`${community.name} logo`}
                      className="w-12 h-12 rounded-lg object-cover border border-border shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-border">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">
                          {community.name}
                        </h3>
                        <Badge className={getTypeColor(community.type)}>
                          <span className="flex items-center gap-1">
                            {getTypeIcon(community.type)}
                            {community.type.charAt(0).toUpperCase() + community.type.slice(1)}
                          </span>
                        </Badge>
                        {community.trending && (
                          <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {community.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{formatMemberCount(community.members)} members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{community.posts_today} posts today</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(community.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {community.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {community.topics.map((topic, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0 w-full sm:w-auto">
                      <Button
                        size="sm"
                        className="whitespace-nowrap w-full sm:w-auto"
                        variant="outline"
                        onClick={() => handleJoinCommunity(community.id)}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Join
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCommunities.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No communities found</h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? "Try adjusting your search terms."
              : "Be the first to create a community!"}
          </p>
        </div>
      )}

      {/* Create Community Modal */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Create a community</h2>
                <button
                  onClick={() => {
                    setShowCreateDialog(false);
                    setCurrentStep(1);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  Step {currentStep} of 3
                </p>
                <div className="flex space-x-2">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        step <= currentStep ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-6">
                {renderStepContent()}
              </div>

              <div className="flex justify-between">
                <div className="flex gap-2">
                  {currentStep > 1 && (
                    <Button variant="outline" onClick={prevStep}>
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  
                  {currentStep < 3 ? (
                    <Button 
                      onClick={nextStep}
                      disabled={currentStep === 1 && !formData.community_name.trim()}
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleCreateCommunity}
                      disabled={!formData.community_name.trim() || !formData.isPolicy}
                    >
                      Create Community
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}