// pages/WatchPage.tsx
import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { LoadingSpinner1 } from "@/utils/LoadingSpinner";
import BookmarkToggleButton from "@/utils/bookmarkButton";


axios.defaults.withCredentials = true;
// axios.defaults.baseURL = "https://acadex-tutor-ai.onrender.com";
axios.defaults.baseURL = "http://localhost:5050";

export const WatchPage = () => {
  const { videoId } = useParams(); // get videoId from URL
  const [video, setVideo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const response = await axios.get(`/api/youtube/video/${videoId}`);
        console.log("Fetched video details:", response.data);
        setVideo(response.data);
      } catch (err) {
        console.error("Error fetching video", err);
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideoDetails();
    }
  }, [videoId]);

  if (loading) return <div className="p-6"><LoadingSpinner1 /></div>;
  if (!video) return <div className="p-6 text-red-600">Video not found</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Now Watching</h1>
      <div className="flex justify-between items-center p-2 border-b border-border">
        <h2 className="text-lg font-semibold">Your Video Resource</h2>

        {videoId && <BookmarkToggleButton itemId={videoId} type="video" />}
      </div>
      <h2 className="text-lg font-semibold mb-2">{video.snippet.title}</h2>

      <div className=" w-full aspect-video mb-4">
        <iframe
          className="w-full h-full rounded-xl shadow-lg"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={`${video.snippet.title} - YouTube`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      <p className="text-sm  mt-2 text-gray-100">
        Channel: <strong>{video.snippet.channelTitle}</strong>
      </p>
      <p className="text-sm text-gray-400 mt-1">
        Published on:{" "}
        {new Date(video.snippet.publishedAt).toLocaleDateString()}
      </p>
    </div>
  );
};
