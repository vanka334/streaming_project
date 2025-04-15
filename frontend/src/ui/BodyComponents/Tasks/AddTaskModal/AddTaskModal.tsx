import React, { useState } from 'react';
import {Status} from "../../../../api/Models/Status.ts";
import {User} from "../../../../api/Models/User.ts";


interface AddTaskModalProps {
  statuses: Status[];
  users: User[];
  currentUser: User;
  onClose: () => void;
  onSubmit: (taskData: {
    name: string;
    description: string;
    status_detail: number;
    setter_detail: number;
    executor_detail: number | null;
  }) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  statuses,
  users,
  currentUser,
  onClose,
  onSubmit
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<Status>(statuses[0]);
  const [selectedExecutor, setSelectedExecutor] = useState<User | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      name,
      description,
      status_detail: selectedStatus.id,
      setter_detail: 1,
      executor_detail: selectedExecutor?.id || null
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="close-button">×</button>
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