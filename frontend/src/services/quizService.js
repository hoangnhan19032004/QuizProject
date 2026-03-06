import axios from "axios";

const API = "http://localhost:3000/api/quizzes";

export const getQuizzes = () => axios.get(API);

export const createQuiz = (data) => axios.post(API, data);

export const updateQuiz = (id, data) =>
  axios.put(`${API}/${id}`, data);

export const deleteQuiz = (id) =>
  axios.delete(`${API}/${id}`);