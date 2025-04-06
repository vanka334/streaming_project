import {User} from "./User.ts";
import {Project} from "./Project.ts";

export interface Department {
  id: number;
  name: string;
  folder: string;
  isManagement: boolean;
  users?: User[];
  projects?: Project[];
}