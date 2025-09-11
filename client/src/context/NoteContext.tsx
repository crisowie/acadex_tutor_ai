// src/context/NotesContext.tsx
import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import axios from "axios";
import { Note, NotesContextType } from "@/types";

// Axios global setup
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "https://acadex-tutor-ai.onrender.com";
// axios.defaults.baseURL ="http://localhost:5050";
// Create Auth Context


const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) throw new Error("useNotes must be used within a NotesProvider");
  return context;
};

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all notes
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/note/all");
      setNotes(res.data.notes);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new note
  const addNote = useCallback(async (chatId: string, title: string, content: string) => {
    try {
      const res = await axios.post( "/note/add",{ chatId, title, content },
      );
      setNotes((prev) => [res.data, ...prev]);
      fetchNotes();
      return true
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add note");
    }
  }, []);

  // Delete note
  const deleteNote = useCallback(async (id: string) => {
    try {
      await axios.delete(`/note/delete/${id}`);
      fetchNotes();
      return true
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete note");
    }
  }, []);

  // Fetch notes once when provider mounts
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return (
    <NotesContext.Provider value={{ notes, fetchNotes, addNote, deleteNote, loading, error }}>
      {children}
    </NotesContext.Provider>
  );
};
