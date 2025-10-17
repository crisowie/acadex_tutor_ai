import { useState, useEffect } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "https://acadex-tutor-ai.onrender.com";
// axios.defaults.baseURL = "http://localhost:5050";
export interface ResourceData {
  openlearn: {
    title: string;
    link: string;
    category?: string;
  }[];
  openlibrary: {
    title: string;
    author?: string;
    year?: number;
    cover?: string | null;
  }[];
  khanAcademy: {
    title: string;
    url: string;
  }[];
  youtube: {
    title: string;
    channel: string;
    thumbnail: string;
    link: string;
  }[];
}

export function useResourceSearch(query: string) {
  const [data, setData] = useState<ResourceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setData(null);
      return;
    }

    const fetchResources = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(
          `/api/resources/search`,
          {
            params: { query },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // 🔐 if you store JWT
            }, // if using cookies
          }
        );

        if (res.data?.success) {
          setData(res.data.data);
        } else {
          setError("Failed to load resources");
        }
      } catch (err) {
        console.error("Resource Fetch Error:", err);
        setError("Network error while fetching resources");
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResources, 500); // debounce input
    return () => clearTimeout(debounce);
  }, [query]);

  return { data, loading, error };
}
