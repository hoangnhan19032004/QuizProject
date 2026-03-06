import { useEffect, useState } from "react";

export default function AdminUsers() {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    Username: "",
    Role: "user",
    IsActive: true
  });

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {

      const res = await fetch("http://localhost:3000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Không thể tải users");

      setUsers(Array.isArray(data) ? data : []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEdit = (user) => {

    setEditingUser(user);

    setFormData({
      Username: user.Username,
      Role: user.Role,
      IsActive: user.IsActive
    });

  };

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

  };

  const handleUpdate = async () => {

    try {

      const res = await fetch(
        `http://localhost:3000/api/admin/users/${editingUser.Id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert("Cập nhật thành công");

      setEditingUser(null);
      fetchUsers();

    } catch (err) {
      alert(err.message);
    }

  };

  const toggleStatus = async (user) => {

    try {

      const res = await fetch(
        `http://localhost:3000/api/admin/users/${user.Id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...user,
            IsActive: !user.IsActive
          })
        }
      );

      if (!res.ok) throw new Error("Cập nhật trạng thái thất bại");

      fetchUsers();

    } catch (err) {
      alert(err.message);
    }

  };

  if (loading)
    return <p className="p-8 text-gray-600">Đang tải dữ liệu...</p>;

  if (error)
    return <p className="p-8 text-red-500">{error}</p>;

  return (

    <div className="p-10">

      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        User Management
      </h1>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

        <table className="w-full text-gray-800">

          <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">

            <tr>
              <th className="py-4 px-6 text-left">Username</th>
              <th className="py-4 px-6 text-left">Role</th>
              <th className="py-4 px-6 text-left">Status</th>
              <th className="py-4 px-6 text-left">Action</th>
            </tr>

          </thead>

          <tbody>

            {users.map((user, index) => (

              <tr
                key={user.Id}
                className={`border-b hover:bg-gray-100 transition ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >

                <td className="py-4 px-6 font-semibold">
                  {user.Username}
                </td>

                <td className="py-4 px-6">

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.Role === "admin"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {user.Role}
                  </span>

                </td>

                <td className="py-4 px-6">

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.IsActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {user.IsActive ? "Active" : "Locked"}
                  </span>

                </td>

                <td className="py-4 px-6 flex gap-2">

                  <button
                    onClick={() => openEdit(user)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => toggleStatus(user)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md text-sm"
                  >
                    {user.IsActive ? "Lock" : "Unlock"}
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>


      {/* MODAL */}

      {editingUser && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-xl w-96 shadow-xl text-gray-900">

            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Edit User
            </h2>

            <input
              name="Username"
              value={formData.Username}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2 w-full mb-3 text-gray-900 bg-white"
            />

            <select
              name="Role"
              value={formData.Role}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2 w-full mb-3 text-gray-900 bg-white"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <select
              name="IsActive"
              value={formData.IsActive}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  IsActive: e.target.value === "true"
                })
              }
              className="border border-gray-300 rounded p-2 w-full mb-4 text-gray-900 bg-white"
            >
              <option value="true">Active</option>
              <option value="false">Locked</option>
            </select>

            <div className="flex gap-2">

              <button
                onClick={handleUpdate}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Save
              </button>

              <button
                onClick={() => setEditingUser(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}