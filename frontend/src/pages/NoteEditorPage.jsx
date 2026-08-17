import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import api from "../services/api";

function NoteEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);

  useEffect(() => {
    const loadNote = async () => {
      if (!isEditMode) return;

      try {
        setFetching(true);
        const response = await api.get(`/notes/${id}`);
        const note = response.data.note;

        setForm({
          title: note.title || "",
          content: note.content || "",
        });
      } catch (error) {
        const message = error.response?.data?.message || "Unable to load the note.";
        toast.error(message);
        navigate("/dashboard", { replace: true });
      } finally {
        setFetching(false);
      }
    };

    loadNote();
  }, [id, isEditMode, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required.");
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        await api.put(`/notes/${id}`, form);
        toast.success("Note updated.");
      } else {
        await api.post("/notes", form);
        toast.success("Note created.");
      }

      navigate("/dashboard", { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || "Unable to save note.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-2xl border border-blue-100 bg-white p-6 shadow-xl shadow-blue-50 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
              {isEditMode ? "Edit note" : "New note"}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {isEditMode ? "Update your note" : "Write a new note"}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700"
          >
            Back
          </button>
        </div>

        {fetching ? (
          <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50 p-8 text-center text-blue-700">
            Loading note...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="Note title"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label htmlFor="content" className="mb-2 block text-sm font-medium text-slate-700">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="Write your note here..."
                rows={12}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
                required
              />
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {loading ? "Saving..." : isEditMode ? "Save changes" : "Save note"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default NoteEditorPage;
