import axios from "axios";
import {Folder} from "../Models/Folder.ts";
import api from "../interceptors.ts";
import {FolderCreate} from "../Models/FolderCreate.ts";


export interface FileSystemResponse {
  folders: Folder[];
  files: File[];
}
export const fetchFileSystem = async (currentDirectory: number | null): Promise<FileSystemResponse> => {
    const params = new URLSearchParams();

    if (currentDirectory !== null) {
        params.append('directory', currentDirectory.toString());
    }

    const response = await api.get(
        `http://localhost:8000/api/v1/files/filesystem/`,
        { params }
    );

    return response.data;
}
 // путь до твоего api-инстанса

export const fetchFileBlob = async (filePath: string): Promise<Blob> => {
  const API_URL = 'localhost:8080'; // укажи базовый URL своего API

  const response = await fetch(`${API_URL}${filePath}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json', // если нужно
      // Добавь другие заголовки, если требуется (например, авторизация)
    },
  });

  if (!response.ok) {
    throw new Error('Ошибка при скачивании файла');
  }

  return response.blob(); // Возвращаем blob-данные
};

export const fetchCreateFile = async (folderId: number, file: File, name: string ): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folderId.toString());
  formData.append('name', name);

  const response = await api.post('files/file/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });

  return response.data;
};
export const fetchDeleteFile = async(file_Id:number)=>{
    await api.delete(`files/file/?file_Id=${file_Id}` )
}
export const fetchCreateFolder = async (folder: FolderCreate): Promise<Folder> => {
  const response = await api.post<Folder>('files/folder/', folder); // Указываем, что возвращается `Folder`
  return response.data; // Предполагаем, что сервер возвращает созданную папку
};