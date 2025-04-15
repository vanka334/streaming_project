import axios from "axios";
import {Folder} from "../Models/Folder.ts";
import api from "../interceptors.ts";


interface FileSystemResponse {
  folders: Folder[];
  files: File[];
}
export const fetchFileSystem =  async (currentDirectory:number):Promise<FileSystemResponse> => {
    const response = await api.get(
        `http://localhost:8000/api/v1/files/filesystem/?directory=${currentDirectory}`
    );
    return response.data

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