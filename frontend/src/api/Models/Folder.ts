import {Department} from "./Department.ts";

export interface Folder {
  id: number;
  name: string;
  path: string;
  parent?: number | Folder | null;
  departments?: Department[];
  subfolders?: Folder[];
  files?: File[];
  is_common?: boolean;
}
