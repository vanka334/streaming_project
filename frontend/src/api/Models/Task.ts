import {Status} from "./Status.ts";
import {User} from "./User.ts";
import {Project} from "./Project.ts";


export interface Task {
  id: number;
  name: string;
  description: string;
  status_detail: Status | number;
  setter_detail: User | number;
  executor_detail: User | number | null;
  comments?: Comment[];
  isDone?: boolean;
  is_overdue?: boolean;
  deadline?: string;
  created_at?: string;
  project?:Project | number;

}