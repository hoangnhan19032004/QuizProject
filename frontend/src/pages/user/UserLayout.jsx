import { Link, Outlet } from "react-router-dom";
import { LogOut, BookOpen, LayoutDashboard } from "lucide-react";

export default function UserLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-slate-900">

      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 shadow-lg p-6 flex flex-col justify-between">

        <div>
          <h2 className="text-xl font-bold mb-8 dark:text-white">
            🎓 User Panel
          </h2>

          <nav className="space-y-3">
            <Link
              to="/user/dashboard"
              className="flex items-center gap-2 p-3 rounded-xl hover:bg-indigo-100 dark:hover:bg-slate-700"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>

            <Link
              to="/user/quizzes"
              className="flex items-center gap-2 p-3 rounded-xl hover:bg-indigo-100 dark:hover:bg-slate-700"
            >
              <BookOpen size={18} />
              Quizzes
            </Link>
          </nav>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="flex items-center gap-2 text-gray-500 hover:text-red-500"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}