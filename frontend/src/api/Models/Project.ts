import {Department} from "./Department.ts";

export interface Project {
  id: number;
  name: string;
  description: string;
  departments?: Department[] | number[];
}