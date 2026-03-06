import axios from "axios";

const API = "http://localhost:3000/api/stats";

export const getStats = () => axios.get(API);