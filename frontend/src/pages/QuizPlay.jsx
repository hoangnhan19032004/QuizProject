import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, Flag } from "lucide-react";

export default function QuizPlay() {

  const { id } = useParams();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const [user, setUser] = useState(null);
  const [timeLeft, setTimeLeft] = useState(900);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  /* =============================
        DEMO QUIZ
  ============================== */
  const quiz = {
    duration: 900,
    questions: Array.from({ length: 10 }, (_, i) => ({
      text: `Câu hỏi số ${i + 1}: React dùng để làm gì?`,
      answers: [
        "Xây dựng UI",
        "Quản lý database",
        "Viết hệ điều hành",
        "Thiết kế phần cứng",
      ],
      correct: 0,
    })),
  };

  const question = quiz.questions[currentQuestion];

  /* =============================
        LOAD USER
  ============================== */
  useEffect(() => {

    const storedUser = sessionStorage.getItem("quizUser");

    if (!storedUser) {
      navigate("/join");
      return;
    }

    setUser(JSON.parse(storedUser));

  }, [navigate]);



  /* =============================
        RESTORE TIMER + ANSWERS
  ============================== */
  useEffect(() => {

    const savedTime = localStorage.getItem("quizTime");
    const savedAnswers = localStorage.getItem("quizAnswers");

    if (savedTime) setTimeLeft(Number(savedTime));
    else setTimeLeft(quiz.duration);

    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));

  }, []);




  /* =============================
        TIMER (PRO FIX)
  ============================== */
  useEffect(() => {

    if (!user) return;

    timerRef.current = setInterval(() => {

      setTimeLeft(prev => {

        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true); // auto submit
          return 0;
        }

        localStorage.setItem("quizTime", prev - 1);
        return prev - 1;
      });

    }, 1000);

    return () => clearInterval(timerRef.current);

  }, [user]);




  /* =============================
        AUTO SAVE ANSWERS
  ============================== */
  useEffect(() => {
    localStorage.setItem("quizAnswers", JSON.stringify(answers));
  }, [answers]);




  /* =============================
        WARNING WHEN EXIT
  ============================== */
  useEffect(() => {

    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", warn);

    return () => window.removeEventListener("beforeunload", warn);

  }, []);




  const formatTime = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / quiz.questions.length) * 100;
  const timeProgress = (timeLeft / quiz.duration) * 100;



  const selectAnswer = (index) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: index,
    }));
  };



  /* =============================
        🔥 SUBMIT PRO
  ============================== */
  const handleSubmit = (auto = false) => {

    clearInterval(timerRef.current);

    localStorage.removeItem("quizAnswers");
    localStorage.removeItem("quizTime");

    let correct = 0;

    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });

    const total = quiz.questions.length;
    const wrong = total - correct;
    const percent = Math.round((correct / total) * 100);

    const timeSpent = quiz.duration - timeLeft;

    //--------------------------------
    // SAVE RESULT
    //--------------------------------
    sessionStorage.setItem(
      "quizResult",
      JSON.stringify({
        correct,
        wrong,
        total,
        percent,
        timeSpent,
        autoSubmitted: auto,
      })
    );

    navigate("/result");
  };



  if (!user) return null;



  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-900">

      {/* SIDEBAR */}
      <div className="hidden lg:flex flex-col w-80 border-r bg-background p-5">

        {/* USER */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <p className="font-bold">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <p className="text-xs">PIN: <b>{user.pin}</b></p>
          </CardContent>
        </Card>


        {/* TIMER */}
        <Card className="mb-4">
          <CardContent className="p-4 text-center">

            <div className="flex justify-center gap-2 text-sm text-muted-foreground">
              <Clock size={16}/>
              Thời gian còn lại
            </div>

            <h1 className={`text-3xl font-bold ${
              timeLeft < 60 ? "text-red-500 animate-pulse" : "text-indigo-600"
            }`}>
              {formatTime()}
            </h1>

            <Progress value={timeProgress} className="h-2 mt-2"/>
          </CardContent>
        </Card>


        {/* PROGRESS */}
        <Card className="mb-4">
          <CardContent className="p-4">
            {answeredCount}/{quiz.questions.length} câu
            <Progress value={progress} className="h-2 mt-2"/>
          </CardContent>
        </Card>


        {/* GRID */}
        <div className="grid grid-cols-5 gap-2">
          {quiz.questions.map((_, index) => {

            const answered = answers[index] !== undefined;

            return (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`h-10 rounded-lg font-semibold
                  ${currentQuestion === index
                    ? "bg-indigo-600 text-white"
                    : answered
                      ? "bg-green-500 text-white"
                      : "bg-slate-200 dark:bg-slate-700"}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <Button
          className="mt-auto"
          onClick={() => setConfirmSubmit(true)}
        >
          <Flag size={16} className="mr-2"/>
          Nộp bài
        </Button>

      </div>



      {/* MAIN */}
      <div className="flex-1 flex justify-center items-center p-6">

        <motion.div
          key={currentQuestion}
          initial={{opacity:0,y:20}}
          animate={{opacity:1,y:0}}
          className="w-full max-w-3xl"
        >
          <Card className="shadow-xl rounded-2xl">
            <CardContent className="p-8">

              <h2 className="font-bold text-xl mb-4">
                Câu {currentQuestion + 1}
              </h2>

              <p className="text-lg font-semibold mb-6">
                {question.text}
              </p>

              <div className="grid gap-3">
                {question.answers.map((ans, i) => {

                  const selected = answers[currentQuestion] === i;

                  return (
                    <motion.button
                      whileHover={{scale:1.02}}
                      whileTap={{scale:0.98}}
                      key={i}
                      onClick={() => selectAnswer(i)}
                      className={`p-4 rounded-xl border text-left
                        ${selected
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white dark:bg-slate-800 hover:border-indigo-400"}`}
                    >
                      {ans}
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  disabled={currentQuestion === 0}
                  onClick={() => setCurrentQuestion(q => q-1)}
                >
                  Câu trước
                </Button>

                <Button
                  disabled={currentQuestion === quiz.questions.length-1}
                  onClick={() => setCurrentQuestion(q => q+1)}
                >
                  Câu tiếp
                </Button>
              </div>

            </CardContent>
          </Card>
        </motion.div>
      </div>



      {/* SUBMIT MODAL */}
      <AnimatePresence>
        {confirmSubmit && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex justify-center items-center"
            initial={{opacity:0}}
            animate={{opacity:1}}
            exit={{opacity:0}}
          >
            <Card className="w-[400px]">
              <CardContent className="p-6">

                <h2 className="font-bold text-lg mb-2">
                  Xác nhận nộp bài?
                </h2>

                <p className="text-muted-foreground mb-4">
                  Bạn đã làm {answeredCount}/{quiz.questions.length} câu.
                </p>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmSubmit(false)}
                  >
                    Hủy
                  </Button>

                  <Button onClick={() => handleSubmit(false)}>
                    Nộp bài
                  </Button>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
