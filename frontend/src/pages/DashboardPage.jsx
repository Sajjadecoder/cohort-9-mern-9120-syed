import { useEffect, useState } from "react";
import { NotebookPen, Plus, Trash2, UserCircle2, Search, Clock, AlertTriangle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../services/api";

const ACCENTS = [
  { bar: "bg-blue-500", chip: "bg-blue-50 text-blue-600" },
  { bar: "bg-violet-500", chip: "bg-violet-50 text-violet-600" },
  { bar: "bg-amber-500", chip: "bg-amber-50 text-amber-600" },
  { bar: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-600" },
  { bar: "bg-rose-500", chip: "bg-rose-50 text-rose-600" },
];

function DashboardPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/notes");
      setNotes(response.data.notes || []);
    } catch (error) {
      const message = error.response?.data?.message || "Unable to fetch notes.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDelete = async (noteId) => {
    try {
      setDeleting(true);
      await api.delete(`/notes/${noteId}`);
      toast.success("Note deleted.");
      fetchNotes();
    } catch (error) {
      const message = error.response?.data?.message || "Unable to delete note.";
      toast.error(message);
    } finally {
      setDeleting(false);
      setNoteToDelete(null);
    }
  };

  const requestDelete = (note) => {
    setNoteToDelete(note);
  };

  const cancelDelete = () => {
    if (deleting) return;
    setNoteToDelete(null);
  };

  const confirmDelete = () => {
    if (!noteToDelete) return;
    handleDelete(noteToDelete.id);
  };

  const filteredNotes = notes.filter((note) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      note.title?.toLowerCase().includes(q) ||
      note.content?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-100 px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8 rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-[0_20px_45px_rgba(37,99,235,0.08)] backdrop-blur-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                <NotebookPen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-blue-600">
                  Dashboard
                </p>
                <div className="mt-1 flex items-center gap-2.5">
                  <h1 className="text-3xl font-bold text-slate-900">Your notes</h1>
                  {!loading && notes.length > 0 && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-sm font-semibold text-blue-600">
                      {notes.length}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-medium text-slate-700 transition duration-150 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-[0.97]"
              >
                <UserCircle2 className="h-5 w-5" />
                Profile
              </button>

              <button
                type="button"
                onClick={() => navigate("/notes/new")}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-blue-200 transition duration-150 hover:bg-blue-700 hover:shadow-blue-300 active:scale-[0.97]"
              >
                <Plus className="h-4 w-4" />
                New note
              </button>
            </div>
          </div>

          {/* Search */}
          {!loading && notes.length > 0 && (
            <div className="mt-5 border-t border-slate-100 pt-5">
              <div className="relative max-w-sm">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search your notes..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
          )}
        </header>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-52 animate-pulse rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
              >
                <div className="mb-4 h-3 w-16 rounded-full bg-slate-100" />
                <div className="mb-3 h-5 w-3/4 rounded-full bg-slate-100" />
                <div className="space-y-2">
                  <div className="h-3 w-full rounded-full bg-slate-100" />
                  <div className="h-3 w-full rounded-full bg-slate-100" />
                  <div className="h-3 w-2/3 rounded-full bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-blue-200 bg-white/80 p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <NotebookPen className="h-7 w-7" />
            </div>
            <p className="text-xl font-semibold text-slate-800">No notes yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Create your first note to get started.
            </p>
            <button
              type="button"
              onClick={() => navigate("/notes/new")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700 active:scale-[0.97]"
            >
              <Plus className="h-4 w-4" />
              Create a note
            </button>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Search className="h-6 w-6" />
            </div>
            <p className="text-lg font-semibold text-slate-700">No matches</p>
            <p className="mt-1 text-sm text-slate-500">
              Nothing matches "{query}". Try a different search.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredNotes.map((note, index) => {
              const accent = ACCENTS[index % ACCENTS.length];
              return (
                <article
                  key={note.id}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_16px_35px_rgba(59,130,246,0.14)]"
                >
                  <span
                    className={`absolute left-0 top-0 h-full w-1 ${accent.bar} opacity-70 transition-opacity duration-200 group-hover:opacity-100`}
                  />

                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] ${accent.chip}`}
                      >
                        Note
                      </p>
                      <h2 className="mt-2 line-clamp-2 text-xl font-semibold text-slate-900">
                        {note.title}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => requestDelete(note)}
                      className="rounded-lg p-2 text-slate-300 opacity-0 transition duration-150 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="line-clamp-5 flex-1 text-sm leading-6 text-slate-600">
                    {note.content}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>

                    <button
                      type="button"
                      onClick={() => navigate(`/notes/${note.id}`)}
                      className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 transition duration-150 hover:bg-blue-600 hover:text-white"
                    >
                      Open
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {noteToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-note-title"
          onClick={cancelDelete}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={cancelDelete}
                disabled={deleting}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h2 id="delete-note-title" className="mt-4 text-lg font-semibold text-slate-900">
              Delete this note?
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <span className="font-medium text-slate-700">"{noteToDelete.title}"</span>?
              This can't be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                disabled={deleting}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-200 transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete note"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;