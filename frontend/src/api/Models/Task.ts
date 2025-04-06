import {Status} from "./Status.ts";
import {User} from "./User.ts";

export interface Task {
  id: number;
  name: string;
  description: string;
  status_detail: Status | number;
  setter_detail: User | number;
  executor_detail: User | number | null;
  comments?: Comment[];
}