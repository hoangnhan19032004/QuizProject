import { useEffect, useState } from "react";

export default function UserDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:3000/api/profile", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">
        Welcome, {user.Username} 👋
      </h2>

      <div className="space-y-3 dark:text-gray-300">
        <p><strong>ID:</strong> {user.Id}</p>
        <p><strong>Role:</strong> {user.Role}</p>
        <p><strong>Status:</strong> {user.IsActive ? "Active" : "Locked"}</p>
      </div>
    </div>
  );
}