import { motion } from "framer-motion";
import { BookOpen, Brain, Trophy } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="
        min-h-screen flex flex-col
        bg-white text-slate-900
        
        dark:bg-gradient-to-br
        dark:from-slate-900
        dark:via-indigo-900
        dark:to-slate-900
        dark:text-white
        
        transition-colors duration-500
      "
    >
      <Navbar />

      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center px-6 mt-24">
        
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-extrabold leading-tight max-w-4xl"
        >
          Nền tảng trắc nghiệm online <br />
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
            dành cho học sinh, sinh viên và giáo viên
          </span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="
            mt-6 text-lg max-w-xl
            text-slate-600
            dark:text-slate-300
          "
        >
          Tạo quiz trong vài giây, chia sẻ với bạn bè và theo dõi tiến trình học tập của bạn một cách dễ dàng.
        </motion.p>

        {/* BUTTON */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10"
        >
          <button
            onClick={() => navigate("/join")}
            className="
              px-10 py-4 
              rounded-2xl 
              bg-indigo-600 
              hover:bg-indigo-700 
              text-white
              transition 
              shadow-2xl 
              text-lg 
              font-semibold
              hover:scale-105
              active:scale-95
            "
          >
            Tham gia ngay
          </button>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="grid md:grid-cols-3 gap-8 px-10 mt-32 pb-24 max-w-6xl mx-auto w-full">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10 }}
            className="
              p-8 
              rounded-3xl 

              bg-white
              border border-slate-200
              shadow-lg

              dark:bg-white/5
              dark:border-white/10
              dark:shadow-xl

              backdrop-blur-lg
              hover:border-indigo-400/40
              transition
            "
          >
            <feature.icon
              size={42}
              className="text-indigo-500 mb-4"
            />

            <h3 className="text-xl font-semibold mb-2">
              {feature.title}
            </h3>

            <p className="text-slate-600 dark:text-slate-300">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </section>

      {/* Footer */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

const features = [
  {
    icon: BookOpen,
    title: "Kho đề phong phú",
    desc: "Hàng ngàn câu hỏi thuộc nhiều lĩnh vực giúp bạn luyện tập mỗi ngày.",
  },
  {
    icon: Brain,
    title: "Chấm điểm thông minh",
    desc: "Xem kết quả ngay lập tức và phân tích điểm mạnh, điểm yếu.",
  },
  {
    icon: Trophy,
    title: "Bảng xếp hạng",
    desc: "Cạnh tranh với bạn bè và leo top để khẳng định bản thân.",
  },
];
