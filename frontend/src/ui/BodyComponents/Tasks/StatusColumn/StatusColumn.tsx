import {Status} from "../../../../api/Models/Status.ts";
import {Task} from "../../../../api/Models/Task.ts";
import {User} from "../../../../api/Models/User.ts";
import React from 'react';
import {Draggable, Droppable} from '@hello-pangea/dnd';
import {TaskUnit} from '../TaskUnit/TaskUnit.tsx'
interface StatusColumnProps {
  status: Status;
  tasksByStatus: Record<number, Task[]>;
  getUserDisplay: (userRef: User | number | null) => React.ReactNode;
  onTaskClick: (task: Task) => void;
}

export const StatusColumn = React.memo(({
  status,
  tasksByStatus,
  getUserDisplay,
  onTaskClick
}: StatusColumnProps) => {
  const tasks = tasksByStatus[status.id] || [];

  return (
    <Droppable droppableId={String(status.id)}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`status-column ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
        >
          <h2 className="status-header">{status.name}</h2>
          <div className="tasks-container">
            {tasks.map((task, index) => (
              <Draggable key={`task-${task.id}`} draggableId={`task-${task.id}`} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`${snapshot.isDragging ? 'dragging' : ''}`}
                  >
                    <TaskUnit
                      task={task}
                      isPreCommit = {status.isFinal}
                      onClick={() => onTaskClick(task)}
                      getUserDisplay={getUserDisplay}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
});