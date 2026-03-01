import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function UserDashboard({ toggleTheme }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState("myQuizzes");

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-slate-900">
        <h1>Vui lòng đăng nhập</h1>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-slate-900 text-white">

      {/* Sidebar */}
      <div className="w-64 bg-slate-800 p-6 space-y-4">
        <h2 className="text-xl font-bold mb-6">USER PANEL</h2>

        <button onClick={() => setActiveTab("myQuizzes")} className="block w-full text-left hover:text-indigo-400">
          📚 Quiz của tôi
        </button>

        <button onClick={() => setActiveTab("createQuiz")} className="block w-full text-left hover:text-indigo-400">
          ➕ Tạo Quiz mới
        </button>

        <button onClick={() => setActiveTab("results")} className="block w-full text-left hover:text-indigo-400">
          📊 Xem kết quả
        </button>

        <button onClick={handleLogout} className="block w-full text-left text-red-400 mt-6">
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">

        <div className="flex justify-between mb-8">
          <h1 className="text-3xl font-bold">
            {activeTab === "myQuizzes" && "Quiz của tôi"}
            {activeTab === "createQuiz" && "Tạo Quiz mới"}
            {activeTab === "results" && "Kết quả học sinh"}
          </h1>
        </div>

        {/* MY QUIZZES */}
        {activeTab === "myQuizzes" && (
          <div className="bg-white/10 p-6 rounded-xl">
            <p>Danh sách quiz đã tạo sẽ hiển thị ở đây</p>
            <button className="mt-4 px-4 py-2 bg-red-500 rounded">
              Xóa quiz
            </button>
          </div>
        )}

        {/* CREATE QUIZ */}
        {activeTab === "createQuiz" && (
          <div className="bg-white/10 p-6 rounded-xl space-y-4">
            <input
              type="text"
              placeholder="Tên Quiz"
              className="w-full p-3 rounded bg-white/20"
            />

            <textarea
              placeholder="Mô tả Quiz"
              className="w-full p-3 rounded bg-white/20"
            />

            <button className="px-4 py-2 bg-green-500 rounded">
              Lưu Quiz
            </button>

            <hr className="my-4 border-white/20" />

            <h3 className="font-bold">Thêm câu hỏi</h3>

            <select className="w-full p-3 rounded bg-white/20">
              <option>Trắc nghiệm</option>
              <option>Đúng / Sai</option>
              <option>Tự luận</option>
            </select>

            <textarea
              placeholder="Nhập nội dung câu hỏi"
              className="w-full p-3 rounded bg-white/20"
            />

            <input
              type="text"
              placeholder="Đáp án A"
              className="w-full p-2 rounded bg-white/20"
            />
            <input
              type="text"
              placeholder="Đáp án B"
              className="w-full p-2 rounded bg-white/20"
            />
            <input
              type="text"
              placeholder="Đáp án C"
              className="w-full p-2 rounded bg-white/20"
            />
            <input
              type="text"
              placeholder="Đáp án D"
              className="w-full p-2 rounded bg-white/20"
            />

            <button className="px-4 py-2 bg-blue-500 rounded">
              Thêm câu hỏi
            </button>
          </div>
        )}

        {/* RESULTS */}
        {activeTab === "results" && (
          <div className="bg-white/10 p-6 rounded-xl">
            <p>Danh sách học sinh đã làm quiz sẽ hiển thị ở đây</p>
          </div>
        )}

      </div>
    </div>
  );
}