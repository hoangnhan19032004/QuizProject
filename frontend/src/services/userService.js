import api from "./axios";

export const getUsers = (page = 1, role = "") =>
  api.get(`/users?page=${page}&role=${role}`);

export const createUser = (data) =>
  api.post("/users", data);

export const updateUser = (id, data) =>
  api.put(`/users/${id}`, data);

export const deleteUser = (id) =>
  api.delete(`/users/${id}`);