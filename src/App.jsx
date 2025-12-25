import { useState } from "react";

function App() {
  const [queryType, setQueryType] = useState("plant");
  const [query, setQuery] = useState("");
  const [output, setOutput] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
  const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

  const searchGroq = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setOutput("");
    setImage("");

    const prompt =
      queryType === "plant"
        ? `You are an expert herbalist. Provide HTML-formatted details for the plant "${query}" including titles (in bold texts) AYURVEDIC USES:, MEDICAL BENEFITS:, and REMEDY PREPERATION:.`
        : `You are an expert herbalist. Provide HTML-formatted remedies and beneficial plants for the disease "${query}".`;

    try {
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.4,
          }),
        }
      );

      const data = await res.json();

      const text =
        data.choices?.[0]?.message?.content || "No response found.";

      setOutput(text.replace(/```html|```/gi, ""));
      fetchImage();
    } catch (err) {
      console.error(err);
      setOutput("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchImage = async () => {
    try {
      const term =
        queryType === "plant" ? `${query} plant` : `${query} disease`;

      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(
          term
        )}&per_page=1`,
        { headers: { Authorization: PEXELS_API_KEY } }
      );

      const data = await res.json();
      setImage(data.photos?.[0]?.src?.medium || "");
    } catch {
      setImage("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-white flex items-center justify-center px-4">
      {/* Wider container on desktop */}
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 text-white px-6 py-5 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">
            🌿 HerbalGarden 🌿
          </h1>
          <p className="text-sm opacity-90 mt-1">
            Ayurvedic plant & disease insights
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <select
            className="w-full md:w-1/3 rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            value={queryType}
            onChange={(e) => setQueryType(e.target.value)}
          >
            <option value="plant">🌱 Search by Plant</option>
            <option value="disease">🩺 Search by Disease</option>
          </select>

          <input
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder={
              queryType === "plant"
                ? "Enter plant name (e.g. Tulsi)"
                : "Enter disease name (e.g. Cold)"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button
            onClick={searchGroq}
            disabled={loading}
            className="w-full md:w-1/3 rounded-xl bg-green-600 py-2.5 text-white font-semibold hover:bg-green-700 disabled:opacity-50 transition"
          >
            {loading ? "Searching..." : "Search"}
          </button>

          {/* Results layout */}
          {output && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Text */}
              <div className="lg:col-span-2 rounded-2xl bg-green-50 border border-green-200 p-4 text-sm leading-relaxed text-gray-800">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: output }}
                />
              </div>

              {/* Image */}
              {image && (
                <div className="flex justify-center items-start">
                  <img
                    src={image}
                    alt="result"
                    className="rounded-2xl shadow-md object-cover max-h-[420px]"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
