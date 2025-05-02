import { Folder } from "../../../api/Models/Folder.ts";
import { File } from "../../../api/Models/File.ts";
import { useEffect, useState, useRef } from "react";
import {
  fetchCreateFolder,
  fetchDeleteFile,
  fetchFileBlob,
  fetchFileSystem,
  FileSystemResponse
} from "../../../api/fetchs/FileSystemApi.ts";
import { fetchCreateFile } from "../../../api/fetchs/FileSystemApi.ts"; // тут путь к твоему методу
import './FileSystemBrowser.css';
import {FolderCreate} from "../../../api/Models/FolderCreate.ts";

export default function FileSystemBrowser() {
  const [currentDirectory, setCurrentDirectory] = useState<number>(null);
  const [fileSystem, setFileSystem] = useState<FileSystemResponse >({ folders: [], files: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Folder[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const api_url = "http://localhost:8000";
  const determineRootFolderId = (data: FileSystemResponse): number => {
    if (data.folders.length > 0) return data.folders[0].parent;
    if (data.files.length > 0) return data.files[0].folder;
    return 10; // fallback
  };

  // Эффект для начальной загрузки файловой системы
  useEffect(() => {
    const loadInitialFileSystem = async () => {
      try {
        setLoading(true);
        // Первый запрос - без указания директории
        const data = await fetchFileSystem(undefined);
        setFileSystem(data);

        // Устанавливаем корневую директорию на основе ответа
        const rootId = determineRootFolderId(data);
        setCurrentDirectory(rootId);

        setError(null);
      } catch (err) {
        setError('Не удалось загрузить файловую систему');
        console.error('Ошибка при загрузке файловой системы:', err);
      } finally {
        setLoading(false);
      }
    };

    // Загружаем только если currentDirectory еще не установлен
    if (currentDirectory === undefined) {
      loadInitialFileSystem();
    }
  }, []); // Пустой массив зависимостей - выполняется только при монтировании

  // Эффект для загрузки при изменении currentDirectory
  useEffect(() => {
    if (currentDirectory === undefined) return;

    const loadFileSystem = async () => {
      try {
        setLoading(true);
        const data = await fetchFileSystem(currentDirectory);
        setFileSystem(data);
        setError(null);
      } catch (err) {
        setError('Не удалось загрузить файловую систему');
        console.error('Ошибка при загрузке файловой системы:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFileSystem();
  }, [currentDirectory]);
 const handleCreateFolder = async (folderName: string, parentId: number) => {
  const path = breadcrumbs
    .map(folder => folder.path) // Извлекаем path из каждого Folder
    .filter(path => path) // Убираем пустые значения
    .join("/"); // Объединяем через слэш
  const folderData: FolderCreate = {
    name: folderName,
    path: path,
    parent: parseInt(parentId),
  };

  try {
    const createdFolder = await fetchCreateFolder(folderData);
    alert("Папка успешно создана!");

    // Обновляем fileSystem, добавляя новую папку
    setFileSystem(prev => ({
      ...prev,
      folders: [...prev.folders, createdFolder]
    }));

    // Если нужно, добавляем папку в breadcrumbs
    // setBreadcrumbs(prev => [...prev, createdFolder]);

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

       const parentFolder = newBreadcrumbs.length > 0
      ? newBreadcrumbs[newBreadcrumbs.length - 1].id
      : determineRootFolderId(fileSystem); // Используем ту же логику
    setCurrentDirectory(parentFolder);
    }
  };

  const navigateToBreadcrumb = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentDirectory(newBreadcrumbs[index].id);
  };

  const handleDownload = async (file: File) => {
    try {
      const blob = await fetchFileBlob(file.file);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Ошибка при скачивании файла:", error);
    }
  };

  const handleUploadButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await fetchCreateFile(currentDirectory, file, file.name);

      // После успешной загрузки обновляем содержимое папки
      const updatedData = await fetchFileSystem(currentDirectory);
      setFileSystem(updatedData);
    } catch (error) {
      console.error('Ошибка при отправке файла:', error);
    }
  };
  const handleDeleteFile = async(fileId:number)=>{
    await fetchDeleteFile(fileId);
     setFileSystem(prev => ({
    ...prev,
    files: prev.files.filter(file => file.id !== fileId) // Удаляем файл из состояния
  }));

}


  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
      <div className="file-system-browser">
        <div className="breadcrumbs">
          <button onClick={navigateUp} disabled={breadcrumbs.length === 0}>
            ↑ Наверх
          </button>
          <span
              onClick={() => {
                setBreadcrumbs([]);
                setCurrentDirectory(determineRootFolderId(fileSystem));
              }}
              style={{cursor: 'pointer', margin: '0 5px'}}
          >
          Корневая папка
        </span>
          {breadcrumbs.map((folder, index) => (
              <span key={folder.id}>
            &gt;
                <span
                    onClick={() => navigateToBreadcrumb(index)}
                    style={{cursor: 'pointer', margin: '0 5px'}}
                >
              {folder.name}
            </span>
          </span>
          ))}
        </div>

        <div className="upload-section" style={{margin: '10px 0'}}>
          <button onClick={handleUploadButtonClick}>Загрузить файл</button>
          <input
              type="file"
              ref={fileInputRef}
              style={{display: 'none'}}
              onChange={handleFileChange}
          />
        </div>
        <div className="upload-section" style={{margin: '10px 0'}}>
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
                    <li
                        key={folder.id}
                        onClick={() => navigateToFolder(folder)}
                        style={{cursor: 'pointer'}}
                    >
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
                      <a
                          href={api_url + file.file}
                          rel="noopener noreferrer"
                          download
                      >
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
