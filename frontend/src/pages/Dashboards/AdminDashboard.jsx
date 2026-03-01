import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  Users,
  BarChart3,
  LogOut,
  Search,
  PlusCircle
} from "lucide-react";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from "@/services/userService";

import UserModal from "@/components/modals/UserModal";

export default function AdminDashboard() {

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) navigate("/login");
  }, [navigate, user]);

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <h1 className="text-red-600 font-semibold text-lg">
          Bạn không có quyền truy cập
        </h1>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  /* ================= FETCH USERS ================= */
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(); // load ngay khi vào dashboard
  }, [fetchUsers]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa?")) return;
    await deleteUser(id);
    fetchUsers();
  };

  const filteredUsers = users.filter(u =>
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-slate-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-gradient-to-b from-indigo-700 to-indigo-900 text-white p-6 shadow-2xl">

        <h2 className="text-2xl font-bold mb-12 tracking-wide">
          5AT ADMIN
        </h2>

        <SidebarButton
          icon={<BarChart3 size={18} />}
          label="Dashboard"
          active={activeTab === "dashboard"}
          onClick={() => setActiveTab("dashboard")}
        />

        <SidebarButton
          icon={<Users size={18} />}
          label="Users"
          active={activeTab === "users"}
          onClick={() => setActiveTab("users")}
        />

        <button
          onClick={handleLogout}
          className="mt-20 flex items-center gap-2 text-red-300 hover:text-red-400 transition"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-10">

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            <StatCard
              title="TOTAL USERS"
              value={users.length}
              icon={<Users size={20} />}
            />

            <StatCard
              title="TOTAL QUIZ"
              value="--"
              icon={<BarChart3 size={20} />}
            />

            <StatCard
              title="TOTAL QUESTIONS"
              value="--"
            />

            <StatCard
              title="TOTAL ATTEMPTS"
              value="--"
            />

          </div>
        )}

        {/* USERS */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl shadow-xl p-8">

            <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">

              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search user..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
              </div>

              <button
                onClick={() => {
                  setSelectedUser(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl shadow hover:bg-indigo-700 transition"
              >
                <PlusCircle size={18} /> Add User
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">
                Đang tải dữ liệu...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">

                  <thead className="border-b">
                    <tr className="text-gray-700 font-semibold text-sm">
                      <th className="py-3">Email</th>
                      <th>Role</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map(u => (
                      <tr
                        key={u.id}
                        className="border-b hover:bg-slate-50 transition"
                      >
                        <td className="py-4 font-medium text-gray-800">
                          {u.email}
                        </td>

                        <td>
                          <RoleBadge role={u.role} />
                        </td>

                        <td className="text-right space-x-4">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setIsModalOpen(true);
                            }}
                            className="text-yellow-600 hover:text-yellow-700 font-medium"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(u.id)}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <UserModal
        isOpen={isModalOpen}
        user={selectedUser}
        onClose={() => setIsModalOpen(false)}
        onSave={async (data) => {
          if (selectedUser) {
            await updateUser(selectedUser.id, data);
          } else {
            await createUser(data);
          }
          setIsModalOpen(false);
          fetchUsers();
        }}
      />
    </div>
  );
}

/* ================= COMPONENTS ================= */

function SidebarButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl mb-4 transition ${
        active
          ? "bg-white text-indigo-700 font-semibold shadow"
          : "hover:bg-indigo-600"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-700 font-semibold text-sm tracking-wide">
            {title}
          </h3>
          <p className="text-3xl font-bold mt-2 text-indigo-700">
            {value}
          </p>
        </div>
        {icon && (
          <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  const styles = {
    admin: "bg-red-100 text-red-600",
    teacher: "bg-blue-100 text-blue-600",
    student: "bg-green-100 text-green-600"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[role]}`}>
      {role}
    </span>
  );
}