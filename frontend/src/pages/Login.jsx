import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email, // đổi thành email nếu backend dùng email
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed!");
        return;
      }

      // nếu backend trả token
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      alert("Đăng nhập thành công!");
      navigate("/dashboard");

    } catch (error) {
      console.error(error);
      alert("Server error!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 px-4">
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
      >
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-300">
            Đăng nhập để tiếp tục tạo quiz nhé!
          </p>
        </div>

        <button
          className="
            w-full mb-5
            flex items-center justify-center gap-3
            py-3 rounded-xl
            bg-white text-slate-800
            font-semibold
            shadow-lg
            hover:scale-[1.03]
            active:scale-95
            transition
          "
        >
          <svg width="22" height="22" viewBox="0 0 48 48">
            <path fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.7 32.1 29.3 35 24 35c-6.1 
              0-11-4.9-11-11s4.9-11 11-11c2.8 0 
              5.3 1 7.3 2.7l5.7-5.7C33.5 6.5 
              29 5 24 5 12.4 5 3 14.4 3 
              26s9.4 21 21 21 21-9.4 
              21-21c0-1.8-.2-3.5-.4-5.5z"/>
            <path fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.7 16.1 
              18.9 13 24 13c2.8 0 5.3 
              1 7.3 2.7l5.7-5.7C33.5 
              6.5 29 5 24 5c-7.7 
              0-14.3 4.3-17.7 10.7z"/>
            <path fill="#4CAF50"
              d="M24 47c5.2 0 9.9-2 
              13.2-5.2l-6.1-5c-2 
              1.5-4.6 2.2-7.1 
              2.2-5.2 0-9.6-3.5-11.2-8.2l-6.5 
              5C9.5 42.5 16.2 47 24 47z"/>
            <path fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-1 
              3-3.3 5.5-6.1 
              7l6.1 5C39.9 36.7 45 
              30.8 45 24c0-1.8-.2-3.5-.4-5.5z"/>
          </svg>

          Đăng nhập với Google
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-slate-400 text-sm">OR</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="flex justify-between text-sm text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-indigo-600" />
              Remember me
            </label>

            <Link
              to="/forgot-password"
              className="hover:text-white transition"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="
              w-full py-3 rounded-xl
              bg-gradient-to-r
              from-indigo-500
              to-violet-500
              hover:from-indigo-400
              hover:to-violet-400
              text-white font-semibold text-lg
              shadow-lg
              hover:scale-[1.02]
              active:scale-95
              transition
            "
          >
            Login
          </button>
        </form>

        <p className="text-center text-slate-300 text-sm mt-6">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Tạo tài khoản
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
