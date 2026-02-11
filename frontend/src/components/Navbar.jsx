import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import logo from "../assets/Logo.png";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  // ✅ Reload thật khi click logo
  const handleReloadHome = () => {
    window.location.href = "/";
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="sticky top-4 z-50 mx-4 lg:mx-10"
    >
      <div
        className="
          flex items-center justify-between
          h-[72px]
          px-6 lg:px-10
          rounded-2xl
          backdrop-blur-2xl
          border shadow-xl
          transition-all duration-300
          bg-white/70 dark:bg-slate-900/70
          border-slate-200 dark:border-white/10
        "
      >
        {/* ✅ Logo reload */}
        <div
          onClick={handleReloadHome}
          className="flex items-center gap-1 group cursor-pointer select-none"
        >
          <img
            src={logo}
            alt="Logo 5AT-QUIZ"
            className="
              h-[64px]
              w-auto
              object-contain
              -mr-2
              transition duration-300
              group-hover:scale-110
            "
          />

          <span
            className="
              text-xl lg:text-2xl
              font-extrabold
              tracking-tight
              bg-gradient-to-r
              from-indigo-500
              via-purple-500
              to-pink-500
              bg-clip-text
              text-transparent
            "
          >
            5AT-QUIZ
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">

          {/* ✅ Dark Mode Button đẹp hơn */}
          <button
            onClick={toggleTheme}
            className="
              px-4 py-2
              rounded-xl
              font-semibold
              transition-all duration-300
              bg-slate-200 dark:bg-slate-700
              hover:scale-105
              active:scale-95
              text-slate-800 dark:text-white
            "
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>

          {/* Login */}
          <Link
            to="/login"
            className="
              px-6 py-2.5
              rounded-xl
              bg-gradient-to-r
              from-indigo-600
              to-purple-600
              hover:from-indigo-500
              hover:to-purple-500
              text-white
              transition-all duration-300
              shadow-lg shadow-indigo-500/20
              font-semibold
              hover:scale-105
              active:scale-95
            "
          >
            Đăng nhập
          </Link>

        </div>
      </div>
    </motion.nav>
  );
}
