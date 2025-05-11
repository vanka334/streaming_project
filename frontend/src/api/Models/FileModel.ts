import {Folder} from "./Folder.ts";
import {User} from "./User.ts";

export interface FileModel {
  id: number;
  folder: number | Folder;
  file: string; // URL to the file
  name: string;
  owner: number | User;
}