import {Department} from "./Department.ts";

export interface User {
  id: number;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
  name?: string;
  surname?: string;
  patronymic?: string;
  departments?: Department[];
}