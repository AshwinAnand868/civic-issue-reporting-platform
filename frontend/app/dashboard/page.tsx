"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "citizen" | "admin";
};

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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (raw) {
      try {
        setUser(JSON.parse(raw) as User);
      } catch {
        setUser(null);
      }
    }

    const fetchIssues = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/issues`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body?.error || `Failed to fetch issues (${res.status})`
          );
        }

        const data = (await res.json()) as Issue[];
        setIssues(data);
      } catch (err: any) {
        setError(err.message || "Failed to load issues");
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700">
            My Dashboard
          </h1>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="text-right">
                <div className="text-sm text-gray-600">Signed in as</div>
                <div className="font-medium text-gray-800">{user.name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">Not signed in</div>
            )}

            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-50"
            >
              Logout
            </button>
          </div>
        </header>

        {/* User Info Card */}
        {user && (
          <section className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-lg font-semibold">{user.name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
                <div className="text-sm text-gray-500">{user.phone ?? ""}</div>
              </div>
            </div>
          </section>
        )}

        {/* Issues list */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                My Reports
              </h2>
              <div className="text-sm text-gray-500">{issues.length} total</div>
            </div>
            <div>
              <button
                onClick={() => router.push("/report-issue")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Report Issue
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg p-6 shadow">
              Loading reports…
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded">{error}</div>
          ) : issues.length === 0 ? (
            <div className="bg-white rounded-lg p-6 shadow">
              <p className="text-gray-700">
                You haven’t reported any issues yet.
              </p>
              {/* <button
                onClick={() => router.push("/report")}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Report an Issue
              </button> */}
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {issues.map((issue) => (
                <div
                  key={issue._id}
                  onClick={() =>
                    router.push(`/dashboard/${user?.id}/issues/${issue._id}`)
                  }
                  className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition"
                >
                  {issue.photo_url ? (
                    <img
                      src={issue.photo_url}
                      alt={issue.title}
                      className="w-full h-36 object-cover rounded-md mb-3"
                    />
                  ) : (
                    <div className="w-full h-36 bg-blue-50 rounded-md mb-3 flex items-center justify-center text-blue-400">
                      <span className="text-sm">No image</span>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{issue.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {issue.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {new Date(issue.createdAt).toLocaleString()}
                      </div>
                      <div
                        className="mt-2 inline-block px-2 py-1 rounded text-xs font-medium text-white"
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
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <div className="text-gray-700">
                      Category: {issue.category}
                    </div>
                    <div className="text-gray-500">Status: {issue.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-blue-50 rounded-lg p-4 flex flex-col justify-center">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-bold text-blue-700">{value}</div>
    </div>
  );
}
