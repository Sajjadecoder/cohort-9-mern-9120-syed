import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import api from "../services/api";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["link"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "blockquote",
  "code-block",
  "link",
];

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
      if (!isEditMode) {
        setFetching(false);
        return;
      }

      try {
        setFetching(true);

        const response = await api.get(`/notes/${id}`);
        const note = response.data.note;

        setForm({
          title: note.title || "",
          content: note.content || "",
        });
      } catch (error) {
        const message =
          error.response?.data?.message || "Unable to load the note.";

        toast.error(message);
        navigate("/dashboard", { replace: true });
      } finally {
        setFetching(false);
      }
    };

    loadNote();
  }, [id, isEditMode, navigate]);

  const handleTitleChange = (event) => {
    setForm((current) => ({
      ...current,
      title: event.target.value,
    }));
  };

  const handleContentChange = (content) => {
    setForm((current) => ({
      ...current,
      content,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const plainText = form.content
      .replace(/<(.|\n)*?>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

    if (!form.title.trim() || !plainText) {
      toast.error("Title and content are required.");
      return;
    }

    try {
      setLoading(true);

      const noteData = {
        title: form.title.trim(),
        content: form.content,
      };

      if (isEditMode) {
        await api.put(`/notes/${id}`, noteData);
        toast.success("Note updated.");
      } else {
        await api.post("/notes", noteData);
        toast.success("Note created.");
      }

      navigate("/dashboard", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to save note.";

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
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Title
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleTitleChange}
                placeholder="Note title"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Content
              </label>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-blue-500">
                <ReactQuill
                  theme="snow"
                  value={form.content}
                  onChange={handleContentChange}
                  modules={modules}
                  formats={formats}
                  placeholder="Start writing your note..."
                />
              </div>
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
                {loading
                  ? "Saving..."
                  : isEditMode
                  ? "Save changes"
                  : "Save note"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default NoteEditorPage;