import React, {JSX, useEffect, useState} from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {fetchTasks, fetchStatuses, updateTaskStatus, createTask, updateTask} from '../../../api/fetchs/taskApi';
import './Tasks.css';
import { Task } from "../../../api/Models/Task.ts";
import { Status } from "../../../api/Models/Status.ts";
import { User } from "../../../api/Models/User.ts";
import {fetchUsers} from "../../../api/fetchs/userApi.ts";
import {AddTaskModal} from "./AddTaskModal/AddTaskModal.tsx";
import {EditTaskModal} from "./EditTaskModal/EditTaskModal.tsx";
import {Link} from "react-router-dom";

// Вспомогательная функция для переупорядочивания списка
const reorder = (list: Task[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// Перемещение между колонками
const move = (source: Task[], destination: Task[], droppableSource: any, droppableDestination: any) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);
  return { newSource: sourceClone, newDestination: destClone };
};

export default function Tasks() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tasksByStatus, setTasksByStatus] = useState<Record<number, Task[]>>({});
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usersCache, setUsersCache] = useState<Record<number, User>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'doing' | 'assigned'>('all');
  const currentUserId = localStorage.getItem('user_id');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tasksData, statusesData, usersData] = await Promise.all([
          fetchTasks(),
          fetchStatuses(),
          fetchUsers()
        ]);

        // Создаем кэш пользователей
        const cache: Record<number, User> = {};
        tasksData.forEach(task => {
          if (typeof task.setter_detail !== 'number' && !cache[task.setter_detail.id]) {
            cache[task.setter_detail.id] = task.setter_detail;
          }
          if (task.executor && typeof task.executor !== 'number' && !cache[task.executor.id]) {
            cache[task.executor.id] = task.executor;
          }
        });

        // Группируем задачи по статусам
        const groupedTasks: Record<number, Task[]> = {};
        statusesData.forEach(status_detail => {
          groupedTasks[status_detail.id] = tasksData.filter(task =>
            typeof task.status_detail === 'number'
              ? task.status_detail === status_detail.id
              : task.status_detail.id === status_detail.id
          );
        });

        setUsersCache(cache);
        setTasksByStatus(groupedTasks);
        setStatuses(statusesData);
        setUsers(usersData);
      } catch (err) {
        setError('Ошибка загрузки данных');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Функция форматирования имени пользователя
  const getUserName = (user: User): string => {
    if (user.name && user.surname) {
      return `${user.surname} ${user.name}${user.patronymic ? ` ${user.patronymic}` : ''}`;
    }
    return user.username || user.email.split('@')[0];
  };

  // Функция для отображения пользователя с ссылкой
  const getUserDisplay = (userRef: User | number | null): JSX.Element | string => {
    if (!userRef) return 'Не назначен';
    // Если передан id, пробуем найти пользователя из кэша
    if (typeof userRef === 'number') {
      const user = usersCache[userRef];
      return user ? (
        <Link to={`/user/${user.id}`} className="user-link">
          {getUserName(user)}
        </Link>
      ) : (
        `Пользователь #${userRef}`
      );
    }
    return (
      <Link to={`/user/${userRef.id}`} className="user-link">
        {getUserName(userRef)}
      </Link>
    );
  };

  const filterTasks = (tasks: Record<number, Task[]>): Record<number, Task[]> => {
    if (filter === 'all') return tasks;

    const filtered: Record<number, Task[]> = {};

    for (const statusId in tasks) {
      filtered[statusId] = tasks[statusId].filter(task => {
        if (filter === 'doing') {
          return typeof task.executor_detail === 'number'
            ? task.executor_detail === currentUserId
            : task.executor_detail?.id === currentUserId;
        } else if (filter === 'assigned') {
          return typeof task.setter_detail === 'number'
            ? task.setter_detail === currentUserId
            : task.setter_detail?.id === currentUserId;
        }
        return true;
      });
    }

    return filtered;
  };

  const onDragEnd = async (result: any) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceStatusId = parseInt(source.droppableId);
    const destStatusId = parseInt(destination.droppableId);

    // 1. Создаём глубокую копию текущего состояния
    const updatedTasks = JSON.parse(JSON.stringify(tasksByStatus));

    // 2. Извлекаем задачу из исходного статуса
    const taskToMove = updatedTasks[sourceStatusId][source.index];

    // 3. Удаляем задачу из исходного статуса
    updatedTasks[sourceStatusId].splice(source.index, 1);

    // 4. Добавляем задачу в новый статус
    updatedTasks[destStatusId].splice(destination.index, 0, {
      ...taskToMove,
      status_detail: destStatusId, // Обновляем статус задачи
    });

    // 5. Оптимистичное обновление UI
    setTasksByStatus(updatedTasks);

    try {
      // 6. Отправляем запрос к серверу
      await updateTaskStatus(taskToMove.id, destStatusId);
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      // 7. В случае ошибки — откатываем изменения
      setTasksByStatus(tasksByStatus);
    }
  };


  const handleAddTask = async (taskData: {
    name: string;
    description: string;
    status_detail: number;
    setter_detail: number;
    executor_detail: number | null;
  }) => {
    try {
      // Отправляем на сервер (только ID)
      const response = await createTask(taskData);

      // Для локального состояния создаем полный объект
      const newTask: Task = {
        ...response,
        name: taskData.name,
        description: taskData.description,
        status_detail: statuses.find(s => s.id === taskData.status_detail)!,
        setter_detail: users.find(u => u.id === taskData.setter_detail)!,
        executor_detail: taskData.executor_detail
          ? users.find(u => u.id === taskData.executor_detail)
          : null
      };

      // Обновляем состояние
      setTasksByStatus(prev => ({
        ...prev,
        [taskData.status_detail]: [...(prev[taskData.status_detail] || []), newTask]
      }));

    } catch (error) {
      console.error('Ошибка создания задачи:', error);
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      // Prepare data for API call
      const apiData = {
        name: updatedTask.name,
        description: updatedTask.description,
        status_detail: typeof updatedTask.status_detail === 'number'
          ? updatedTask.status_detail
          : updatedTask.status_detail.id,
        setter_detail: typeof updatedTask.setter_detail === 'number'
          ? updatedTask.setter_detail
          : updatedTask.setter_detail.id,
        executor_detail: updatedTask.executor_detail.id
      };

      await updateTask(updatedTask.id, apiData);

      // Update local state
      setTasksByStatus(prev => {
        const updated = { ...prev };

        // Remove from previous status
        Object.keys(updated).forEach(statusId => {
          updated[+statusId] = updated[+statusId].filter(t => t.id !== updatedTask.id);
        });

        // Add to new status
        const newStatusId = typeof updatedTask.status_detail === 'number'
          ? updatedTask.status_detail
          : updatedTask.status_detail.id;

        updated[newStatusId] = [...(updated[newStatusId] || []), updatedTask];

        return updated;
      });

      setSelectedTask(null);
    } catch (error) {
      console.error('Ошибка обновления задачи:', error);
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  const filteredTasks = filterTasks(tasksByStatus);

  return (
      <div className="task-board">
        <h1>Доска задач</h1>
        <div className="task-controls">
          <button onClick={() => setIsModalOpen(true)} className="add-task-button">
            + Добавить задачу
          </button>
          {/* Фильтры и прочее */}
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="status-columns">
            {statuses.map(status_detail => (
                <Droppable key={status_detail.id} droppableId={String(status_detail.id)}>
                  {(provided, snapshot) => (
                      <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`status-column ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                      >
                        <h2 className="status-header">{status_detail.name}</h2>
                        <div className="tasks-container">
                          {filteredTasks[status_detail.id]?.map((task, index) => (
                              <Draggable key={`task-${task.id}`} draggableId={`task-${task.id}`} index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
                                    >
                                      <h3 onClick={() => setSelectedTask(task)}>{task.name}</h3>
                                      <p className="task-description">{task.description}</p>
                                      <div className="task-meta">
                                        <span>Создатель: {getUserDisplay(task.setter_detail)}</span>
                                        <span>Исполнитель: {getUserDisplay(task.executor_detail)}</span>
                                        {task.comments && task.comments.length > 0 && (
                                            <span>Комментарии: {task.comments.length}</span>
                                        )}
                                      </div>
                                    </div>
                                )}
                              </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                  )}
                </Droppable>
            ))}
          </div>
        </DragDropContext>

        {isModalOpen && (
            <AddTaskModal
                statuses={statuses}
                users={users}
                currentUserId={currentUserId}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddTask}
            />
        )}
        {selectedTask && (
            <EditTaskModal
                key={selectedTask.id}
                task={selectedTask}
                statuses={statuses}
                users={users}
                onClose={() => setSelectedTask(null)}
                onSubmit={handleUpdateTask}
            />
        )}
      </div>
  );
}