import React, { useState } from 'react';
import { Status } from "../../../../api/Models/Status.ts";
import { User } from "../../../../api/Models/User.ts";
import { Project } from "../../../../api/Models/Project.ts";
import './AddTaskModal.css'
interface AddTaskModalProps {
  statuses: Status[];
  users: User[];
  currentUserId: number;
  projects: Project[];
  onClose: () => void;
  onSubmit: (taskData: {
    name: string;
    description: string;
    status_detail: number;
    setter_detail: number;
    executor_detail: number | null;
    project: number;
    deadline?: string;

  }) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  statuses,
  users,
  currentUserId,
  projects,
  onClose,
  onSubmit
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<Status>(statuses[0]);
  const [selectedExecutor, setSelectedExecutor] = useState<User | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project>(projects[0]);
  const [deadline, setDeadline] = useState<string>('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      name,
      description,
      status_detail: selectedStatus.id,
      setter_detail: currentUserId,
      executor_detail: selectedExecutor?.id || null,
      project: selectedProject.id,
      deadline: deadline,
    });
  };
  if (projects.length === 0 || statuses.length === 0) {
  return <div>Загрузка...</div>;
}
  return (
    <div className="modal-overlay">
      <div className="modal-content">

        <h2>Добавить новую задачу</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название:</label>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
          </div>

          <div className="form-group">
            <label>Описание:</label>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
            />
          </div>

          <div className="form-group">
            <label>Проект:</label>
            <select
                value={selectedProject.id}
                onChange={(e) => {
                  const project = projects.find(p => p.id === Number(e.target.value));
                  if (project) setSelectedProject(project);
                }}
                required
            >
              {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Статус:</label>
            <select
                value={selectedStatus.id}
                onChange={(e) => {
                  const status = statuses.find(s => s.id === Number(e.target.value));
                  if (status) setSelectedStatus(status);
                }}
                required
            >
              {statuses.map(status => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Исполнитель:</label>
            <select
                value={selectedExecutor?.id || ''}
                onChange={(e) => {
                  const user = users.find(u => u.id === Number(e.target.value));
                  setSelectedExecutor(user || null);
                }}
            >
              <option value="">Не назначен</option>
              {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} {user.surname}
                  </option>
              ))}
            </select>

          </div>
          <div className="form-group">
            <label>Срок выполнения:</label>
            <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Отмена
            </button>
            <button type="submit" className="submit-button">
              Создать задачу
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
