import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Library,
  Search,
  ExternalLink,
  Download,
  BookOpen,
  Video,
  FileText,
  Globe,
  Star,
  Users,
  Loader2
} from "lucide-react";
import { resources } from "@/types";

 // axios.defaults.baseURL = "https://acadex-tutor-ai.onrender.com";

  axios.defaults.baseURL = "http://localhost:5050";

export default function Resources() {
  axios.defaults.withCredentials = true;
 

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [ytResults, setYtResults] = useState<any[]>([]);
  const [ytLoading, setYtLoading] = useState(false);

  const handleYoutubeSearch = async () => {
    if (!searchTerm.trim()) return;

    setYtLoading(true);
    setYtResults([]); // Clear old results immediately

    try {
      const response = await axios.get(`/api/youtube/search?query=${searchTerm}`);

      if (response.data && response.data.items) {
        setYtResults(response.data.items);
      } else {
        setYtResults([]);
      }
    } catch (error) {
      console.error("YouTube search error:", error);
      setYtResults([]); // Clear results on error
    } finally {
      setYtLoading(false);
    }
  };
  console.log(searchTerm, ytResults);


  useEffect(() => {
    if (ytResults.length > 0) {
      const element = document.getElementById("yt-results");
      element?.scrollIntoView({ behavior: "smooth" });
    }
  }, [ytResults]);



  const categories = ["Mathematics", "English", "Physics", "Chemistry", "Business", "Computer Science", "Programming", "Agricultural Science", "Government"];
  const types = ["Online Course", "University Course", "Video Series", "Textbook", "Specialization", "Calculator", "Simulation", "Database"];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = !selectedCategory || resource.category === selectedCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      "Mathematics": "bg-blue-500/10 text-blue-500 border-blue-500/20",
      "Physics": "bg-purple-500/10 text-purple-500 border-purple-500/20",
      "Chemistry": "bg-green-500/10 text-green-500 border-green-500/20",
      "Biology": "bg-orange-500/10 text-orange-500 border-orange-500/20",
      "Computer Science": "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return colors[category as keyof typeof colors] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="p-6 space-y-6 max-w-fit mx-auto ">
      {/* Header */}
      <div className="overflow-y-auto p-2 pb-5 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-600 h-screen">

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Resources</h1>
              <p className="text-muted-foreground">
                Curated learning materials and study resources
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Library className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{resources.length} resources</span>
            </div>
          </div>
          <form onSubmit={handleYoutubeSearch}>
            <div className="relative flex items-center gap-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                disabled={ytLoading}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchTerm.trim()) {
                    handleYoutubeSearch();
                  }
                }}
                className="pl-9 w-full"
              />

              <Button
                variant="default"
                disabled={ytLoading || !searchTerm.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
              >
                {ytLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search YouTube
                  </>
                )}
              </Button>

            </div>
          </form>





          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 overflow-y-auto p-2 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-600">
            <div className="flex flex-wrap gap-2 overflow-x-auto sm:overflow-visible">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory(null);
                }}
              >
                All Subjects
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(category);
                    setSearchTerm(category);
                    handleYoutubeSearch();
                  }}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">


          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {resources.filter(r => r.free).length}
              </p>
              <p className="text-sm text-muted-foreground">Free Resources</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Video className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {resources.filter(r => r.type.includes('Video') || r.type.includes('Course')).length}
              </p>
              <p className="text-sm text-muted-foreground">Video Content</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">4.7</p>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">30M+</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
        </div>


        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => {
            const Icon = resource.icon;
            return (
              <Card key={resource.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg leading-tight">{resource.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{resource.type}</p>
                      </div>
                    </div>
                    {resource.free && (
                      <Badge variant="secondary" className="text-xs">
                        Free
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Badge className={getCategoryColor(resource.category)}>
                    {resource.category}
                  </Badge>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {resource.description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="font-medium">{resource.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{resource.users}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => window.open(resource.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Resource
                    </Button>
                    <Button variant="outline" size="sm" className="sm:w-auto w-full">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>


        {ytResults.length > 0 && (
          <>
            <h2 id="yt-result" className="text-xl font-bold mt-12 mb-4 text-foreground">YouTube Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ytResults.map((video) => (
                <Card
                  key={video.id.videoId}
                  className="hover:shadow-lg transition-all duration-200"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Video className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg leading-tight">
                            {video.snippet.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {video.snippet.channelTitle}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        YouTube
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <img
                      src={video.snippet.thumbnails.high.url}
                      alt={video.snippet.title}
                      className="rounded-lg w-full h-48 object-cover"
                    />
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {video.snippet.description}
                    </p>
                    <Button
                      className="w-full"
                      onClick={() =>
                        window.location.href = `/watch/${video.id.videoId}`
                      }
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Watch Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}



        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <Library className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No resources found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}