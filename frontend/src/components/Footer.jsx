import { Facebook, Github, Mail, ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");

  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();

    if (!email) return;

    // 👉 Sau này call API ở đây
    alert("Subscribed: " + email);
    setEmail("");
  };

  return (
    <footer className="relative mt-32">

      {/* glow line */}
      <div className="absolute top-0 left-0 w-full h-[1px] 
      bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

      <div className="
        relative
        bg-slate-900/80
        backdrop-blur-2xl
        border-t border-white/10
        shadow-[0_-20px_60px_-15px_rgba(99,102,241,0.25)]
      ">

        {/* background glow */}
        <div className="absolute inset-0 -z-10 
        bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/20" />

        <div className="max-w-7xl mx-auto px-8 py-20 grid md:grid-cols-4 gap-16 text-slate-300">

          {/* BRAND */}
          <div>
            <h2 className="text-3xl font-extrabold mb-5 
            bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 
            bg-clip-text text-transparent">
              5AT-QUIZ
            </h2>

            <p className="text-slate-400 leading-relaxed text-[15px]">
              Nền tảng trắc nghiệm giúp sinh viên học nhanh hơn,
              tạo quiz dễ dàng và cải thiện kết quả học tập.
            </p>

            {/* status */}
            <div className="flex items-center gap-2 mt-6 text-sm text-slate-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              All systems operational
            </div>
          </div>

          {/* LINKS */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-lg">
              Khám phá
            </h3>

            <ul className="space-y-4">
              {[
                { name: "Trang chủ", path: "/" },
                { name: "Kho Quiz", path: "/quiz" },
                { name: "Bảng xếp hạng", path: "/leaderboard" },
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    to={item.path}
                    className="
                      text-slate-400
                      hover:text-white
                      transition
                      hover:translate-x-1
                      inline-block
                    "
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-lg">
              Nhận quiz mới 🚀
            </h3>

            <p className="text-slate-400 text-sm mb-4">
              Nhập email để nhận các bộ quiz hot mỗi tuần.
            </p>

            <form
              onSubmit={handleSubscribe}
              className="flex gap-2"
            >
              <input
                type="email"
                placeholder="Email của bạn..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  flex-1
                  px-4 py-2
                  rounded-lg
                  bg-white/5
                  border border-white/10
                  text-white
                  placeholder-slate-500
                  focus:outline-none
                  focus:ring-2
                  focus:ring-indigo-500
                "
              />

              <button
                className="
                  px-4
                  rounded-lg
                  bg-indigo-600
                  hover:bg-indigo-500
                  transition
                  font-medium
                "
              >
                Gửi
              </button>
            </form>
          </div>

          {/* SOCIAL */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-lg">
              Kết nối
            </h3>

            <div className="flex gap-4">
              {[
                {
                  icon: Facebook,
                  link: "#",
                  hover: "hover:bg-blue-500/20 hover:text-blue-400"
                },
                {
                  icon: Github,
                  link: "#",
                  hover: "hover:bg-white/20 hover:text-white"
                },
                {
                  icon: Mail,
                  link: "mailto:support@5atquiz.com",
                  hover: "hover:bg-pink-500/20 hover:text-pink-400"
                },
              ].map(({ icon: Icon, link, hover }, i) => (
                <motion.a
                  key={i}
                  href={link}
                  whileHover={{ y: -6, scale: 1.05 }}
                  className={`
                    w-12 h-12
                    flex items-center justify-center
                    rounded-xl
                    bg-white/5
                    border border-white/10
                    cursor-pointer
                    transition
                    ${hover}
                  `}
                >
                  <Icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* bottom */}
        <div className="
          border-t border-white/10
          text-center
          py-7
          text-sm
          text-slate-500
          relative
        ">
          © {new Date().getFullYear()}
          <span className="text-slate-300 font-semibold">
            {" "}5AT-QUIZ{" "}
          </span>
          — Bản quyền thuộc về 5AT-QUIZ.

          {/* scroll top */}
          <button
            onClick={scrollTop}
            className="
              absolute right-10 top-1/2 -translate-y-1/2
              w-10 h-10
              rounded-full
              bg-indigo-600
              hover:bg-indigo-500
              flex items-center justify-center
              shadow-lg
              transition
            "
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
}
