// components/TaskCard/TaskCard.tsx
import React, {useState} from 'react';

import { Link } from "react-router-dom";
import {Task} from "../../../../api/Models/Task.ts";
import {User} from "../../../../api/Models/User.ts";
import {commitTask, rejectTask} from "../../../../api/fetchs/taskApi.ts";

interface TaskUnitProps {
  task: Task;
  onClick: () => void;
  getUserDisplay: (userRef: User | number | null) => React.ReactNode;
  isPreCommit:boolean;

}

export const TaskUnit = React.memo(({ task, onClick, getUserDisplay,isPreCommit }: TaskUnitProps) => {
    const currentUserId = parseInt(localStorage.getItem("user_id"));
    const isExecutor =
  typeof task.executor_detail === "object" &&
  task.executor_detail !== null &&
  "id" in task.executor_detail &&
  task.executor_detail.id === currentUserId;
    const [commit,setCommit] = useState<string>(null);
    const [isCommited,setIsCommited] = useState<string>(null)
    const handleCommit = async(taskId:number) =>{
        try {
            await commitTask(taskId);
            setIsCommited("Подтверждено")
        }
        catch(err){
            return (<p>Ошибка</p>)
        }


    }
    const handleReject = async(taskId:number)=>{
        await rejectTask(taskId);
        setIsCommited("Отклоненно")
    }
    return (
    <div className={task.is_overdue? ("task-card-overdue") : ("task-card")}>
      <h3 onClick={onClick}>{task.name}</h3>
      <p className="task-description">{task.description}</p>
      <div className="task-meta">
        <span>Создатель: {getUserDisplay(task.setter_detail)}</span>
        <span>Исполнитель: {getUserDisplay(task.executor_detail)}</span>
        {task.comments && task.comments.length > 0 && (
          <span>Комментарии: {task.comments.length}</span>
        )}

          <span>Дата создания: {new Date(task.created_at).toLocaleString("ru-RU")}</span>
          <span>Срок выполнения: {new Date(task.deadline).toLocaleString("ru-RU")}</span>
            {task.is_overdue ? (<span style={{ color: 'red' }}>Задача просрочена!</span>):(<span>Ждет выполнения</span>) }
      {isPreCommit && !isExecutor && !task.isDone && (
  <div className="project-actions">
    {isCommited ? (
      <span>{isCommited}</span>
    ) : (
      <>
        <button onClick={() => handleCommit(task.id)}>Подтвердить</button>
        <button onClick={() => handleReject(task.id)}>Отклонить</button>
      </>
    )}
  </div>
)}

{task.isDone && (
  <div className="project-actions">
    <span>Подтверждено</span>
  </div>
)}
      </div>
    </div>
    );
});