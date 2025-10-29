"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Issue = {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: "Low" | "Medium" | "High";
  status: string;
  photo_url?: string;
  voice_url?: string;
  createdAt: string;
};

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();

  const userId = params.username as string; // now it's actually the user ID
  const issueId = params.id as string;

  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchIssue = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/issues/users/${userId}/issues/${issueId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || "Failed to fetch issue");
        }

        const data = (await res.json()) as Issue;
        setIssue(data);
      } catch (err: any) {
        setError(err.message || "Failed to load issue details");
      } finally {
        setLoading(false);
      }
    };

    if (userId && issueId) fetchIssue();
  }, [userId, issueId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <p className="text-gray-600 text-lg">Loading issue details...</p>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50">
        <p className="text-red-600 text-lg mb-4">{error || "Issue not found"}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700">{issue.title}</h1>
          <span
            className="px-3 py-1 rounded text-sm font-semibold text-white"
            style={{
              backgroundColor:
                issue.priority === "High"
                  ? "#ef4444"
                  : issue.priority === "Medium"
                  ? "#f59e0b"
                  : "#10b981",
            }}
          >
            {issue.priority}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          <div><strong>Category:</strong> {issue.category}</div>
          <div><strong>Status:</strong> {issue.status}</div>
          <div><strong>Created:</strong> {new Date(issue.createdAt).toLocaleString()}</div>
        </div>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
          <p className="text-gray-700 leading-relaxed">{issue.description}</p>
        </section>

        {(issue.photo_url || issue.voice_url) && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {issue.photo_url && (
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-2">Attached Image</h3>
                <img src={issue.photo_url} alt="Issue Photo" className="rounded-lg shadow-md w-full object-cover"/>
              </div>
            )}
            {issue.voice_url && (
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-2">Voice Recording</h3>
                <audio controls src={issue.voice_url} className="w-full mt-2"/>
              </div>
            )}
          </section>
        )}

        <div className="flex justify-end">
          <button
            onClick={() => router.back()}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
