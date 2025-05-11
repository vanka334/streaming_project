import React, { useEffect, useState } from 'react';
import { Status } from "../../../../api/Models/Status";
import { User } from "../../../../api/Models/User";
import { Task } from "../../../../api/Models/Task";
import { Comment } from "../../../../api/Models/Comment.ts";
import { TaskComments } from "../TaskComment/TaskComment.tsx";
import { Project } from "../../../../api/Models/Project.ts";
import './EditTaskModal.css'
interface EditTaskModalProps {
  task: Task;
  statuses: Status[];
  users: User[];
  projects: Project[];
  currentUserId: number;
  onClose: () => void;
  onSubmit: (updatedTask: Task) => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  statuses,
  users,
  projects,
  currentUserId,
  onClose,
  onSubmit
}) => {
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description);
  const [deadline, setDeadline] = useState<string>(task.deadline || '');
  const [status, setStatus] = useState<Status | null>(
    typeof task.status_detail === 'number'
      ? statuses.find(s => s.id === task.status_detail) || null
      : task.status_detail
  );
  const [executor, setExecutor] = useState<User | null>(
    typeof task.executor_detail === 'number'
      ? users.find(u => u.id === task.executor_detail) || null
      : task.executor_detail
  );
  const [selectedProject, setSelectedProject] = useState<Project>(
    typeof task.project === 'number'
      ? projects.find(p => p.id === task.project)!
      : task.project
  );



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) return;

    const updatedTask: Task = {
      ...task,
      name,
      description,
      status_detail: status,
      executor_detail: executor,
      project: selectedProject,
      deadline: deadline || null,
    };

    onSubmit(updatedTask);
  };

  const isExecutor = currentUserId === (typeof task.executor_detail === 'number'
    ? task.executor_detail
    : task.executor_detail?.id);

  return (
    <div className="modal-overlay">
      <div className="modal-content">

        <h2>Редактировать задачу</h2>

        {isExecutor ? (
            <div className="readonly-fields">
              <div className="form-group">
                <label>Название:</label>
                <div>{name}</div>
              </div>

              <div className="form-group">
                <label>Описание:</label>
                <div>{description}</div>
              </div>

              <div className="form-group">
                <label>Статус:</label>
                <div>{status?.name}</div>
              </div>

              <div className="form-group">
                <label>Проект:</label>
                <div>{selectedProject.name}</div>
              </div>

              <div className="form-group">
                <label>Исполнитель:</label>
                <div>{executor ? `${executor.name} ${executor.surname}` : 'Не назначен'}</div>
              </div>
              <div className="form-group">
                <label>Срок выполнения:</label>
                <div>{deadline}</div>
              </div>

            </div>
        ) : (
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
                <label>Проект:</label>
                <select value={selectedProject.id} onChange={(e) => {
                  const found = projects.find(p => p.id === Number(e.target.value));
                  if (found) setSelectedProject(found);
                }}>
                  {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
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
              <div className="form-group">
                <label>Срок выполнения:</label>
                <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={onClose}>Отмена</button>
                <button type="submit">Сохранить</button>
              </div>
            </form>
        )}

        <TaskComments
            key={`comments-${task.id}`}
            taskId={task.id}
            currentUser={users.find(u => u.id === currentUserId)!}
            users={users}
        />
      </div>
    </div>
  );
};
