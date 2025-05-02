import {Folder} from "./Folder.ts";

export interface FolderCreate {
  name: string;
  path: string;
  parent: number;
}
