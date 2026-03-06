import { useEffect, useState } from "react";

export default function UserQuizzes() {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/quizzes")
      .then(res => res.json())
      .then(data => setQuizzes(data));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-white">
        Available Quizzes
      </h2>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div
            key={quiz.Id}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow hover:shadow-lg transition"
          >
            <h3 className="text-lg font-bold dark:text-white">
              {quiz.Title}
            </h3>

            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {quiz.Description}
            </p>

            <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700">
              Start Quiz
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}