import React, {useEffect, useState} from 'react';
import { Status } from "../../../../api/Models/Status";
import { User } from "../../../../api/Models/User";
import { Task } from "../../../../api/Models/Task";
import { Comment } from "../../../../api/Models/Comment.ts";
import {TaskComments} from "../TaskComment/TaskComment.tsx"; // Тип задачи

interface EditTaskModalProps {
  task: Task;
  statuses: Status[];
  users: User[];
  onClose: () => void;
  onSubmit: (updatedTask: Task) => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  statuses,
  users,
  onClose,
  onSubmit
}) => {
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<Status | null>(statuses.find(s => s.id === task.status_detail) || null);
  const [executor, setExecutor] = useState<User | null>(users.find(u => u.id === task.executor_detail) || null);

 // Инициализация состояния при получении новой задачи
  useEffect(() => {
    setName(task.name);
    setDescription(task.description);
    setStatus(
      typeof task.status_detail === 'number'
        ? statuses.find(s => s.id === task.status_detail) || null
        : task.status_detail
    );
    setExecutor(
      typeof task.executor_detail === 'number'
        ? users.find(u => u.id === task.executor_detail) || null
        : task.executor_detail
    );
  }, [task, statuses, users]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) return;

    const updatedTask: Task = {
      ...task,
      name,
      description,
      status_detail: status,
      executor: executor?.id || null,
      executor_detail: executor
    };

    onSubmit(updatedTask);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="close-button">×</button>
        <h2>Редактировать задачу</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название:</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required/>
          </div>

          <div className="form-group">
            <label>Описание:</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}/>
          </div>

          <div className="form-group">
            <label>Статус:</label>
            <select value={status?.id || ''} onChange={(e) => {
              const found = statuses.find(s => s.id === Number(e.target.value));
              if (found) setStatus(found);
            }}>
              {statuses.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Исполнитель:</label>
            <select value={executor?.id || ''} onChange={(e) => {
              const found = users.find(u => u.id === Number(e.target.value));
              setExecutor(found || null);
            }}>
              <option value="">Не назначен</option>
              {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.surname}
                  </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose}>Отмена</button>
            <button type="submit">Сохранить</button>
          </div>
        </form>
        <TaskComments
            key={`comments-${task.id}`}
        taskId={task.id}
        currentUser={users.find(u => u.id === 1)!}
        users={users}
        />

       </div>

      </div>

  );
};
