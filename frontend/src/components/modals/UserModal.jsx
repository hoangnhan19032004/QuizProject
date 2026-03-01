import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function UserModal({ isOpen, user, onClose, onSave }) {

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "student"
  });

  useEffect(() => {
    if (user) {
      setForm({
        email: user.email || "",
        password: "",
        role: user.role || "student"
      });
    } else {
      setForm({
        email: "",
        password: "",
        role: "student"
      });
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!form.email) {
      alert("Vui lòng nhập email");
      return;
    }

    if (!user && !form.password) {
      alert("Vui lòng nhập password");
      return;
    }

    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 relative animate-fadeIn">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {user ? "Chỉnh sửa User" : "Thêm User mới"}
        </h2>

        {/* EMAIL */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>

          <input
            type="email"
            placeholder="example@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl 
                       text-gray-800 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* PASSWORD */}
        {!user && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>

            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl 
                         text-gray-800 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        )}

        {/* ROLE */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>

          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl 
                       text-gray-800
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            Hủy
          </button>

          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 
                       text-white font-medium shadow-lg hover:opacity-90 transition"
          >
            Lưu
          </button>
        </div>

      </div>
    </div>
  );
}