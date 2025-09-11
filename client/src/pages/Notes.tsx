import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNotes } from "@/context/NoteContext";
import { jsPDF } from "jspdf";    
import {
  FileText,
  Search,
  Calendar,
  Download,
  Trash2,
  NotebookPen,
} from "lucide-react";

export default function Notes() {
  const [searchTerm, setSearchTerm] = useState("");

  const { notes, loading, error, deleteNote, fetchNotes } = useNotes();



  const filteredNotes = notes.filter((note) => {
    return (
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleDelete = async (id: string) => {
    try {
       const response = await deleteNote(id);
       if (response) {
         toast.success("Note deleted");
       }
    } catch (err) {
      console.error("Failed to delete note", err);
    }
  };


  const handleDownload = (note: any) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");

    // Title
    doc.setFontSize(16);
    doc.text(note.title, 10, 20);

    // Content
    doc.setFontSize(12);
    doc.text(note.content, 10, 40, { maxWidth: 180 }); // wraps text
    doc.save(`${note.title || "note"}.pdf`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notes</h1>
            <p className="text-muted-foreground">
              Your saved highlights and study notes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NotebookPen className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{notes.length} saved</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
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
            <p className="text-2xl font-bold text-foreground">{notes.length}</p>
            <p className="text-sm text-muted-foreground">Total Notes</p>
          </CardContent>
        </Card>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.map((note) => (
          <Card
            key={note.id}
            className="hover:shadow-lg transition-all duration-200"
          >
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">
                          {note.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          Chat #{note.chat_id?.slice(0, 6) || "unknown"}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {note.content}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0 w-full sm:w-auto">
                      <Button
                        size="sm"
                        className="whitespace-nowrap w-full sm:w-auto"
                        variant="outline"
                        onClick={() => handleDownload(note)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(note.id)}
                        className="whitespace-nowrap w-full sm:w-auto text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No notes found</h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? "Try adjusting your search."
              : "Highlight chats and save them as notes to see them here."}
          </p>
        </div>
      )}
    </div>
  );
}
