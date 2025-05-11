// импортируем всё как раньше
import { Folder } from "../../../api/Models/Folder.ts";
import { FileModel } from "../../../api/Models/FileModel.ts";
import { useEffect, useState, useRef } from "react";
import {
  fetchCreateFolder,
  fetchDeleteFile,
  fetchFileBlob,
  fetchFileSystem,
  FileSystemResponse
} from "../../../api/fetchs/FileSystemApi.ts";
import { fetchCreateFile } from "../../../api/fetchs/FileSystemApi.ts";
import './FileSystemBrowser.css';
import { FolderCreate } from "../../../api/Models/FolderCreate.ts";

export default function FileSystemBrowser() {
  const [currentDirectory, setCurrentDirectory] = useState<number | null>(null);
  const [fileSystem, setFileSystem] = useState<FileSystemResponse>({
    core_folder_id: 0,
    folders: [], files: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Folder[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const api_url = "http://localhost:8000";

  // Загрузка корневой папки при монтировании
  useEffect(() => {
  const init = async () => {
    try {
      setLoading(true);

      // Шаг 1: получаем начальные данные
      const rootData = await fetchFileSystem(null);
      const rootId = rootData.core_folder_id;

      // сохраняем сразу в state
      setFileSystem(rootData);
      setCurrentDirectory(rootId); // это спровоцирует второй useEffect ниже

      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке начальной структуры:', err);
      setError('Не удалось загрузить файловую систему');
    } finally {
      setLoading(false);
    }
  };

  if (currentDirectory === null) {
    init();
  }
}, []);

  // Загрузка файлов/папок при смене директории
useEffect(() => {
  if (currentDirectory === null) return;

  const loadFileSystem = async () => {
    try {
      setLoading(true);
      const data = await fetchFileSystem(currentDirectory);
      setFileSystem(data);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке содержимого папки:', err);
      setError('Не удалось загрузить содержимое папки');
    } finally {
      setLoading(false);
    }
  };

  loadFileSystem();
}, [currentDirectory]);

  const handleCreateFolder = async (folderName: string, parentId: number | null) => {
    const path = breadcrumbs.map(folder => folder.path).filter(Boolean).join("/");
    const folderData: FolderCreate = {
      name: folderName,
      path: path,
      parent: Number(parentId),
    };

    try {
      const createdFolder = await fetchCreateFolder(folderData);
      alert("Папка успешно создана!");
      setFileSystem(prev => ({
        ...prev,
        folders: [...prev.folders, createdFolder]
      }));
    } catch (error) {
      console.error("Ошибка при создании папки:", error);
      alert("Не удалось создать папку");
    }
  };

  const navigateToFolder = (folder: Folder) => {
    setCurrentDirectory(folder.id);
    setBreadcrumbs(prev => [...prev, folder]);
  };

  const navigateUp = () => {
    if (breadcrumbs.length > 0) {
      const newBreadcrumbs = [...breadcrumbs];
      newBreadcrumbs.pop();
      setBreadcrumbs(newBreadcrumbs);

      const parentFolderId = newBreadcrumbs.length > 0
        ? newBreadcrumbs[newBreadcrumbs.length - 1].id
        : fileSystem.core_folder_id;

      setCurrentDirectory(parentFolderId);
    }
  };

  const navigateToBreadcrumb = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentDirectory(newBreadcrumbs[index].id);
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || currentDirectory === null) return;

    try {
      await fetchCreateFile(currentDirectory, file, file.name);
      const updatedData = await fetchFileSystem(currentDirectory);
      setFileSystem(updatedData);
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    await fetchDeleteFile(fileId);
    setFileSystem(prev => ({
      ...prev,
      files: prev.files.filter(file => file.id !== fileId)
    }));
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="file-system-browser">
      <div className="breadcrumbs">
        <button onClick={navigateUp} disabled={breadcrumbs.length === 0}>↑ Наверх</button>
        <span
          onClick={() => {
            setBreadcrumbs([]);
            setCurrentDirectory(fileSystem.core_folder_id);
          }}
          style={{ cursor: 'pointer', margin: '0 5px' }}
        >
          Корневая папка
        </span>
        {breadcrumbs.map((folder, index) => (
          <span key={folder.id}>
            &gt;
            <span
              onClick={() => navigateToBreadcrumb(index)}
              style={{ cursor: 'pointer', margin: '0 5px' }}
            >
              {folder.name}
            </span>
          </span>
        ))}
      </div>

      <div className="upload-section" style={{ margin: '10px 0' }}>
        <button onClick={handleUploadButtonClick}>Загрузить файл</button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      <div className="upload-section" style={{ margin: '10px 0' }}>
        <button onClick={() => {
          const folderName = prompt("Введите имя папки:");
          if (folderName) handleCreateFolder(folderName, currentDirectory);
        }}>
          + Создать папку
        </button>
      </div>

      <div className="folders-list">
        <h3>Папки</h3>
        {fileSystem.folders.length === 0 ? (
          <p>Папок нет</p>
        ) : (
          <ul>
            {fileSystem.folders.map(folder => (
              <li key={folder.id} onClick={() => navigateToFolder(folder)} style={{ cursor: 'pointer' }}>
                📁 {folder.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="files-list">
        <h3>Файлы</h3>
        {fileSystem.files.length === 0 ? (
          <p>Файлов нет</p>
        ) : (
          <ul>
            {fileSystem.files.map(file => (
              <li key={file.id}>
                <a href={api_url + file.file} rel="noopener noreferrer" download>
                  📄 {decodeURIComponent(file.file.split('/').pop() || '')}
                </a>
                <button onClick={() => handleDeleteFile(file.id)}>x</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
