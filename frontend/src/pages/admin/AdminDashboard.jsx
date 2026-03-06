import { Users, FileText, Award, Activity } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Tổng Users",
      value: "128",
      icon: <Users size={22} />,
      color: "bg-indigo-500"
    },
    {
      title: "Tổng Bài Làm",
      value: "542",
      icon: <FileText size={22} />,
      color: "bg-emerald-500"
    },
    {
      title: "Điểm Trung Bình",
      value: "7.8",
      icon: <Award size={22} />,
      color: "bg-orange-500"
    },
    {
      title: "Hoạt động hôm nay",
      value: "24",
      icon: <Activity size={22} />,
      color: "bg-pink-500"
    }
  ];

  return (
    <div className="space-y-8">

      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
          👋 Chào mừng trở lại, Admin
        </h1>
        <p className="text-gray-500 mt-2">
          Đây là bảng điều khiển quản trị hệ thống Quiz của bạn.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{item.title}</p>
                <h2 className="text-2xl font-semibold mt-1 text-gray-800">
                  {item.value}
                </h2>
              </div>

              <div
                className={`${item.color} text-white p-3 rounded-xl shadow`}
              >
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Hoạt động gần đây
        </h2>

        <div className="space-y-4 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Người dùng "nhan01" vừa hoàn thành bài thi</span>
            <span className="text-gray-400">2 phút trước</span>
          </div>

          <div className="flex justify-between">
            <span>Admin cập nhật quyền user</span>
            <span className="text-gray-400">10 phút trước</span>
          </div>

          <div className="flex justify-between">
            <span>Bài thi mới được tạo</span>
            <span className="text-gray-400">30 phút trước</span>
          </div>
        </div>
      </div>

    </div>
  );
}