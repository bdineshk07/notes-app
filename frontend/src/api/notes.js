import api from './client';

export const getNotes = (search) =>
  api.get('/notes', { params: search ? { search } : {} });

export const getNote = (id) => api.get(`/notes/${id}`);

export const createNote = (data) => api.post('/notes', data);

export const updateNote = (id, data) => api.put(`/notes/${id}`, data);

export const deleteNote = (id) => api.delete(`/notes/${id}`);