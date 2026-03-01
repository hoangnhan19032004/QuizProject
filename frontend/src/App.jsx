import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboards/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import UserDashboard from "./pages/Dashboards/UserDashboard";
import UserRoute from "./components/UserRoute";
import Register from "./pages/Register";

import QuizPinPage from "./pages/QuizPinPage";
import QuizPlay from "./pages/QuizPlay";
import Result from "./pages/Result";

function App() {

  // ✅ lấy theme đã lưu hoặc theo hệ thống
  const [dark, setDark] = useState(() => {

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      return savedTheme === "dark";
    }

    // fallback theo OS
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // ✅ apply class vào <html>
  useEffect(() => {

    const root = document.documentElement;

    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

  }, [dark]);

  // toggle function
  const toggleTheme = () => setDark(prev => !prev);

  return (
    <BrowserRouter>

      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={<Home toggleTheme={toggleTheme} dark={dark} />}
        />

        {/* AUTH */}
        <Route
          path="/login"
          element={<Login toggleTheme={toggleTheme} dark={dark} />}
        />
        
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <Dashboard dark={dark} toggleTheme={toggleTheme} />
            </AdminRoute>
          }
        />

        <Route
          path="/user/dashboard"
          element={
            <UserRoute>
              <UserDashboard toggleTheme={toggleTheme} />
            </UserRoute>
          }
        />

        <Route
          path="/register"
          element={<Register toggleTheme={toggleTheme} dark={dark} />}
        />

        {/* JOIN QUIZ */}
        <Route
          path="/join"
          element={<QuizPinPage toggleTheme={toggleTheme} dark={dark} />}
        />

        {/* QUIZ */}
        <Route
          path="/quiz/:id"
          element={<QuizPlay toggleTheme={toggleTheme} dark={dark} />}
        />

        {/* RESULT */}
        <Route
          path="/result"
          element={<Result toggleTheme={toggleTheme} dark={dark} />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
