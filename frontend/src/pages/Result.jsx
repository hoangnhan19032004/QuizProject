import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Trophy, RotateCcw, Home, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Result() {

  const navigate = useNavigate();

  //--------------------------------
  // LẤY DATA
  //--------------------------------
  const user = JSON.parse(sessionStorage.getItem("quizUser"));
  const result = JSON.parse(sessionStorage.getItem("quizResult"));

  //--------------------------------
  // REDIRECT SAFE (KHÔNG GÂY LOOP)
  //--------------------------------
  useEffect(() => {
    if (!user || !result) {
      navigate("/join");
    }
  }, [user, result, navigate]);

  if (!user || !result) return null;

  //--------------------------------
  const percent = result.percent;

  const getColor = () => {
    if (percent >= 80) return "text-green-500";
    if (percent >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getMessage = () => {
    if (percent >= 80) return "Xuất sắc! 🎉";
    if (percent >= 50) return "Làm khá tốt!";
    return "Cố gắng thêm nhé!";
  };

  //--------------------------------
  // FORMAT TIME
  //--------------------------------
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  //--------------------------------
  // RETRY
  //--------------------------------
  const handleRetry = () => {

    sessionStorage.removeItem("quizResult");
    localStorage.removeItem("quizAnswers");
    localStorage.removeItem("quizTime");

    navigate("/join");
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
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl"
      >
        <Card className="rounded-3xl shadow-2xl bg-background/80 backdrop-blur-xl border">
          <CardContent className="p-10">

            {/* HEADER */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-yellow-100 dark:bg-yellow-500/20">
                  <Trophy size={42} className="text-yellow-500" />
                </div>
              </div>

              <h1 className="text-3xl font-bold">
                Kết quả bài làm
              </h1>

              {/* USER */}
              <p className="mt-3 font-semibold">
                {user.name}
              </p>

              <p className="text-xs text-muted-foreground">
                PIN: {user.pin}
              </p>

              {user.email && (
                <p className="text-xs text-muted-foreground">
                  {user.email}
                </p>
              )}
            </div>


            {/* SCORE CIRCLE */}
            <div className="flex justify-center mb-10">
              <div className="relative w-44 h-44">

                <div className="absolute inset-0 rounded-full border-[10px] border-muted" />

                <motion.div
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset: 440 - (440 * percent) / 100 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0"
                >
                  <svg width="176" height="176">
                    <circle
                      cx="88"
                      cy="88"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray="440"
                      className={getColor()}
                      style={{
                        transform: "rotate(-90deg)",
                        transformOrigin: "50% 50%",
                      }}
                    />
                  </svg>
                </motion.div>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-bold ${getColor()}`}>
                    {percent}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {getMessage()}
                  </span>
                </div>
              </div>
            </div>


            {/* STATS */}
            <div className="grid grid-cols-3 gap-4 mb-8">

              <Card className="rounded-2xl shadow border">
                <CardContent className="p-5 flex items-center gap-3">
                  <CheckCircle2 className="text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Đúng</p>
                    <p className="text-xl font-bold">{result.correct}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow border">
                <CardContent className="p-5 flex items-center gap-3">
                  <XCircle className="text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sai</p>
                    <p className="text-xl font-bold">{result.wrong}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow border">
                <CardContent className="p-5 flex items-center gap-3">
                  <Clock className="text-indigo-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Thời gian</p>
                    <p className="text-xl font-bold">
                      {formatTime(result.timeSpent)}
                    </p>
                  </div>
                </CardContent>
              </Card>

            </div>


            {/* AUTO SUBMIT WARNING */}
            {result.autoSubmitted && (
              <p className="text-center text-red-500 mb-4 text-sm">
                Hết giờ — bài đã được nộp tự động.
              </p>
            )}


            {/* BUTTONS */}
            <div className="flex gap-3">

              <Button
                className="flex-1 h-12 rounded-xl font-semibold"
                variant="outline"
                onClick={() => navigate("/")}
              >
                <Home size={18} className="mr-2" />
                Trang chủ
              </Button>

              <Button
                className="flex-1 h-12 rounded-xl font-semibold"
                onClick={handleRetry}
              >
                <RotateCcw size={18} className="mr-2" />
                Làm lại
              </Button>

            </div>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
