

import { User } from "./User";

export interface Project {
  id?: number; // При создании может не присутствовать
  name: string;
  description: string;
  users: number[];
   users_detail?: User[];// Связанные пользователи
}
