import {Task} from "./Task.ts";
import {User} from "./User.ts";

export interface Comment {
  id: number;
  task: number | Task;
  author: number | User;
  text: string;
  created_at: string; // ISO datetime string
}