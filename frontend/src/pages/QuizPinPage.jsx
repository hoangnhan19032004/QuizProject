import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { KeyRound, Loader2, User, Mail } from "lucide-react";

export default function QuizPinPage() {
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // ⭐ ref để auto focus
  const nameRef = useRef(null);

  //--------------------------------
  // HANDLE JOIN
  //--------------------------------
  const handleJoinQuiz = async (e) => {
    e.preventDefault(); // ⭐ NGĂN RELOAD

    if (loading) return;

    if (!pin.trim()) {
      setError("Vui lòng nhập mã PIN");
      return;
    }

    if (pin.length < 4) {
      setError("Mã PIN phải từ 4 số trở lên");
      return;
    }

    if (!name.trim()) {
      setError("Vui lòng nhập họ tên");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Fake API
      await new Promise((resolve) => setTimeout(resolve, 900));

      sessionStorage.setItem(
        "quizUser",
        JSON.stringify({
          pin,
          name,
          email,
          joinTime: Date.now(),
        })
      );

      navigate(`/quiz/${pin}`);
    } catch {
      setError("Không tìm thấy quiz với mã này");
    } finally {
      setLoading(false);
    }
  };

  //--------------------------------
  // AUTO FOCUS khi nhập đủ PIN
  //--------------------------------
  const handlePinChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");

    setPin(value);
    setError("");

    if (value.length === 6) {
      nameRef.current?.focus();
    }
  };

  return (
    <div
      className="
      min-h-screen flex items-center justify-center p-6
      bg-gradient-to-br 
      from-indigo-500 via-purple-500 to-blue-500
      dark:from-slate-900 dark:via-slate-800 dark:to-slate-900
    "
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <Card
          className="
          rounded-3xl 
          shadow-2xl 
          border 
          bg-background/80 
          backdrop-blur-xl
        "
        >
          <CardContent className="p-8">
            {/* HEADER */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20">
                  <KeyRound
                    size={40}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                </div>
              </div>

              {/* ⭐ FIX chữ đen luôn */}
              <h1 className="text-3xl font-bold text-black dark:text-white">
                Tham gia Quiz
              </h1>

              <p className="text-muted-foreground mt-2 text-sm">
                Nhập thông tin để bắt đầu làm bài
              </p>
            </div>

            {/* ⭐ FORM CHUẨN ENTER */}
            <form onSubmit={handleJoinQuiz} className="space-y-4">

              {/* PIN */}
              <Input
                placeholder="Mã PIN"
                value={pin}
                onChange={handlePinChange}
                className="text-center text-xl tracking-[0.35em] h-12 font-semibold"
                maxLength={6}
                autoFocus
              />

              {/* NAME */}
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-3 text-muted-foreground"
                />
                <Input
                  ref={nameRef}
                  placeholder="Họ và tên"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  className="pl-10 h-12"
                />
              </div>

              {/* EMAIL */}
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-3 text-muted-foreground"
                />
                <Input
                  placeholder="Email (không bắt buộc)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  type="email"
                />
              </div>

              {/* ERROR */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive text-center"
                >
                  {error}
                </motion.p>
              )}

              {/* BUTTON */}
              <Button
                type="submit"
                className="w-full text-base font-semibold h-12 rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Đang kiểm tra...
                  </span>
                ) : (
                  "Bắt đầu làm bài"
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Không có mã? Hãy liên hệ giảng viên hoặc người tạo quiz.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
