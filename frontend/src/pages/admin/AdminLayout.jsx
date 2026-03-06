import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  LogOut,
  FileText,
  HelpCircle,
  BarChart3,
  Settings,
  Bell,
  Search,
  ChevronDown
} from "lucide-react";

export default function AdminLayout() {

  const location = useLocation();
  const navigate = useNavigate();

  const [openProfile, setOpenProfile] = useState(false);
  const [search, setSearch] = useState("");
  const [notFound, setNotFound] = useState("");

  const menu = [
    { name: "Bảng điều khiển", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Người dùng", path: "/admin/users", icon: <Users size={18} /> },
    { name: "Bài Quiz", path: "/admin/quizzes", icon: <FileText size={18} /> },
    { name: "Câu hỏi", path: "/admin/questions", icon: <HelpCircle size={18} /> },
    { name: "Báo cáo", path: "/admin/reports", icon: <BarChart3 size={18} /> },
    { name: "Cài đặt", path: "/admin/settings", icon: <Settings size={18} /> }
  ];

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {

      const keyword = search.toLowerCase();

      const result = menu.find(item =>
        item.name.toLowerCase().includes(keyword)
      );

      if (result) {
        navigate(result.path);
        setNotFound("");
      } else {
        setNotFound("Không có kết quả");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-indigo-800 text-white flex flex-col justify-between shadow-lg">

        <div>

          <div className="p-6 text-2xl font-bold border-b border-indigo-600">
            ADMIN QUIZ 5AT
          </div>

          <nav className="p-4 space-y-2">

            {menu.map((item) => {

              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition
                  ${
                    isActive
                      ? "bg-white text-indigo-700"
                      : "text-white hover:bg-indigo-700"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );

            })}

          </nav>

        </div>

        <div className="p-4 border-t border-indigo-600">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-white hover:text-red-400 text-sm"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>

      </aside>


      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <header className="bg-white border-b px-8 py-4 flex justify-between items-center">

          <div className="flex items-center gap-6">

            <h1 className="text-xl font-bold text-gray-800">
              Bảng điều khiển quản trị
            </h1>

            {/* SEARCH */}
            <div className="relative hidden md:block">

              <Search
                size={16}
                className="absolute left-3 top-2.5 text-gray-400"
              />

              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                className="border rounded-lg pl-9 pr-4 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {notFound && (
                <div className="absolute mt-2 bg-red-100 text-red-600 px-3 py-1 rounded text-sm shadow">
                  {notFound}
                </div>
              )}

            </div>

          </div>


          {/* RIGHT */}
          <div className="flex items-center gap-4">

            <button className="relative p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-100 transition">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* PROFILE */}
            <div className="relative">

              <div
                onClick={() => setOpenProfile(!openProfile)}
                className="flex items-center gap-3 cursor-pointer"
              >

                <div className="text-sm text-gray-600 hidden sm:block">
                  Xin chào 👋
                  <span className="font-semibold ml-1">
                    Quản trị viên
                  </span>
                </div>

                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                  A
                </div>

                <ChevronDown size={16} />

              </div>

              {openProfile && (

              <div className="absolute right-0 mt-3 w-44 bg-white rounded-lg shadow-lg border">

                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm">
                  Hồ sơ
                </button>

                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm">
                  Cài đặt
                </button>

                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 text-sm"
                >
                  Đăng xuất
                </button>

              </div>

            )}

            </div>

          </div>

        </header>


        {/* CONTENT */}
        <main className="flex-1 p-8">

          <div className="bg-white rounded-xl shadow border p-8">

            <Outlet />

          </div>

        </main>

      </div>

    </div>
  );
}