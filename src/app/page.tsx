"use client";

/**
 * Upload landing page
 * Handles file upload and parsing with Web Worker
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadZone } from "@/components/upload-zone";
import { ProgressBar } from "@/components/progress-bar";
import { saveLibrary } from "@/lib/storage";
import type { Library } from "@/types/library";

type ParsingState = "idle" | "parsing" | "success" | "error";

export default function HomePage() {
  const router = useRouter();
  const [state, setState] = useState<ParsingState>("idle");
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [fileName, setFileName] = useState("");

  // Initialize Web Worker
  const worker = useMemo(() => {
    if (typeof window !== "undefined") {
      return new Worker(new URL("@/workers/parse-worker", import.meta.url));
    }
    return null;
  }, []);

  // Set up worker message handler
  useEffect(() => {
    if (!worker) return;

    worker.onmessage = async (e: MessageEvent) => {
      const { type, percent, message, library, error } = e.data;

      switch (type) {
        case "PARSE_PROGRESS":
          setProgress(percent);
          setProgressMessage(message);
          break;

        case "PARSE_SUCCESS":
          setState("success");
          try {
            await saveLibrary(library as Library);
            toast.success("Library analyzed successfully!", {
              description: `${library.tracks.length} tracks loaded`,
            });
            // Redirect to dashboard
            setTimeout(() => {
              router.push("/dashboard");
            }, 500);
          } catch (err) {
            setState("error");
            toast.error("Failed to save library", {
              description: err instanceof Error ? err.message : "Unknown error",
            });
          }
          break;

        case "PARSE_ERROR":
          setState("error");
          toast.error("Failed to parse file", {
            description: error,
          });
          break;
      }
    };

    worker.onerror = (error) => {
      setState("error");
      toast.error("Worker error", {
        description: error.message,
      });
    };

    return () => {
      worker.terminate();
    };
  }, [worker, router]);

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!worker) {
        toast.error("Worker not initialized");
        return;
      }

      setState("parsing");
      setFileName(file.name);
      setProgress(0);
      setProgressMessage("Starting...");

      worker.postMessage({
        type: "PARSE_FILE",
        file,
      });
    },
    [worker]
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            DJ Library Analyzer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your Rekordbox XML export to analyze your music library with
            detailed statistics, genre distributions, and insights.
          </p>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto">
          {state === "idle" && <UploadZone onFileSelect={handleFileSelect} />}

          {state === "parsing" && (
            <ProgressBar
              percent={progress}
              message={progressMessage}
              fileName={fileName}
            />
          )}

          {state === "success" && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Success!</h2>
              <p className="text-muted-foreground">
                Redirecting to dashboard...
              </p>
            </div>
          )}

          {state === "error" && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Parsing Failed</h2>
              <p className="text-muted-foreground mb-6">
                Please check the error message above and try again.
              </p>
              <button
                onClick={() => setState("idle")}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Features */}
        {state === "idle" && (
          <div className="mt-20 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-center mb-8">
              What You'll Get
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Detailed Statistics</h3>
                <p className="text-sm text-muted-foreground">
                  Track counts, artist diversity, genre distribution, and
                  library growth over time
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Visual Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Interactive charts for BPM, key distribution, and genre
                  breakdowns
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">100% Private</h3>
                <p className="text-sm text-muted-foreground">
                  All processing happens in your browser. Your data never leaves
                  your device. This project is open-source, you can view the
                  source code{" "}
                  <a
                    href="https://github.com/mfbadr/cratehacker"
                    target="_blank"
                    className="text-primary hover:underline"
                  >
                    here.
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
