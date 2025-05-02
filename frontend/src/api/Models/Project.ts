

import { User } from "./User";

export interface Project {
    id: number;
  name: string;
  description: string;
  users_detail: User[];
  statistics?: {
    total_tasks: number;
    completed_tasks: number;
    overdue_tasks: number;
    kpi: number;
    status_distribution: {
      [statusName: string]: number;
    };
  };// Связанные пользователи
}
