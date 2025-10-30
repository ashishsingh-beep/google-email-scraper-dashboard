import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:5000/logs", {
  transports: ["websocket"],
  withCredentials: false,
});

export default function App() {
  const [browsers, setBrowsers] = useState(2);
  const [tabs, setTabs] = useState(2);
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 100 });
  const [csvFile, setCsvFile] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    function onLog(msg) {
      setLogs((prev) => [...prev.slice(-300), msg]);
    }
    function onProgress(data) {
      setProgress(data);
    }
    function onStatus(st) {
      setIsRunning(st === "started" || st === "running");
    }

    socket.on("log", onLog);
    socket.on("progress", onProgress);
    socket.on("status", onStatus);

    return () => {
      socket.off("log", onLog);
      socket.off("progress", onProgress);
      socket.off("status", onStatus);
    };
  }, []);

  const handleUpload = async () => {
    if (!csvFile) return alert("Select a CSV file first!");
    const formData = new FormData();
    formData.append("file", csvFile);

    const res = await fetch("http://localhost:5000/upload-input", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    alert(`Uploaded ${data.rows} rows`);
  };

  const handleStart = async () => {
    const res = await fetch("http://localhost:5000/start-scraper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        browsers: Number(browsers),
        tabsPerBrowser: Number(tabs),
      }),
    });
    const data = await res.json();
    if (data.status === "started") setIsRunning(true);
  };

  const handleStop = async () => {
    await fetch("http://localhost:5000/stop-scraper", { method: "POST" });
    setIsRunning(false);
  };

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100"
          : "bg-gradient-to-br from-gray-100 via-white to-gray-100 text-gray-900"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-10 fade-in">
        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-transparent bg-clip-text animate-gradient-x">
          Google Email Scraper Dashboard
        </h1>

        {/* Dark/Light Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:scale-105 hover:shadow-md transition-all duration-300"
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Upload Section */}
      <div
        className={`p-5 rounded-xl border card-hover fade-in mb-6 ${
          darkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <label className="block mb-2 font-semibold">Upload CSV File</label>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files[0])}
            className="block w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
          >
            Upload
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div
        className={`p-5 rounded-xl border card-hover fade-in mb-6 grid md:grid-cols-3 gap-4 ${
          darkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div>
          <label className="block text-sm font-medium mb-1">BROWSERS</label>
          <input
            type="number"
            value={browsers}
            onChange={(e) => setBrowsers(e.target.value)}
            className={`w-full p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-gray-100"
                : "bg-gray-50 border-gray-300 text-gray-900"
            }`}
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            TABS PER BROWSER
          </label>
          <input
            type="number"
            value={tabs}
            onChange={(e) => setTabs(e.target.value)}
            className={`w-full p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-gray-100"
                : "bg-gray-50 border-gray-300 text-gray-900"
            }`}
            min="1"
          />
        </div>
        <div className="flex items-end gap-3">
          <button
            onClick={handleStart}
            disabled={isRunning}
            className={`flex-1 py-2 rounded-lg text-white transition-all ${
              isRunning
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 glow"
            }`}
          >
            Start
          </button>
          <button
            onClick={handleStop}
            disabled={!isRunning}
            className={`flex-1 py-2 rounded-lg text-white transition-all ${
              !isRunning
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 glow"
            }`}
          >
            Stop
          </button>
        </div>
      </div>

      {/* Progress */}
      <div
        className={`p-5 rounded-xl border card-hover fade-in mb-6 ${
          darkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <label className="block text-sm font-medium mb-2">Progress</label>
        <div className="relative w-full bg-gray-300 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-progressMove"
            style={{
              width: `${(progress.completed / progress.total) * 100}%`,
            }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {progress.completed}/{progress.total} completed
        </p>
      </div>

      {/* Logs */}
      <div
        className={`p-5 rounded-xl border card-hover fade-in h-80 overflow-y-auto ${
          darkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <h2 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">
          Logs
        </h2>
        <div className="text-sm space-y-1 font-mono">
          {logs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No logs yet...</p>
          ) : (
            logs.map((log, i) => (
              <div
                key={i}
                className="text-gray-700 dark:text-gray-300 fade-in"
              >
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
