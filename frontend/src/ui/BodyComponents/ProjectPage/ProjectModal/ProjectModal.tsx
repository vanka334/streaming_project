import React, { useState, useEffect, FormEvent } from 'react';

import './ProjectModal.css';
import {Project} from "../../../../api/Models/Project.ts";
import {User} from "../../../../api/Models/User.ts";
import {fetchUsers} from "../../../../api/fetchs/userApi.ts";
import {createProject, updateProject} from "../../../../api/fetchs/ProjectApi.ts";

interface ProjectModalProps {
  project?: Project; // Если редактирование, передаём объект; для создания оставляем undefined
  onClose: () => void;
  onSave: (project: Project) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose, onSave }) => {
  const [name, setName] = useState<string>(project ? project.name : '');
  const [description, setDescription] = useState<string>(project ? project.description : '');
  // Для выбора пользователей храним массив объектов User
  const [selectedUsers, setSelectedUsers] = useState<User[]>(project && project.users_detail ? project.users_detail : []);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Загружаем список пользователей для выбора
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await fetchUsers();
        setAllUsers(users);
      } catch (err) {
        console.error('Ошибка загрузки пользователей', err);
      }
    };
    loadUsers();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Формируем данные для отправки
    // Здесь поле "users" должно быть массивом id
    const projectData = {
      name,
      description,
      users: selectedUsers.map(user => user.id),
    };

    try {
      if (project && project.id) {
        const updated = await updateProject(project.id, projectData);
        onSave(updated);
      } else {
        const created = await createProject(projectData);
        onSave(created);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка при сохранении проекта');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Получаем выбранные id (в виде строк) и преобразуем в числа
    const selectedIds = Array.from(e.target.selectedOptions, option => Number(option.value));
    const selected = allUsers.filter(user => selectedIds.includes(user.id));
    setSelectedUsers(selected);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{project ? 'Редактировать проект' : 'Создать проект'}</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название проекта</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Введите название"
            />
          </div>
          <div className="form-group">
            <label>Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Введите описание"
            ></textarea>
          </div>
          <div className="form-group">
            <label>Пользователи</label>
            <select multiple value={selectedUsers.map(u => u.id.toString())} onChange={handleUserSelect}>
              {allUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={submitting}>
              Отмена
            </button>
            <button type="submit" disabled={submitting}>
              {project ? 'Сохранить изменения' : 'Создать проект'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
