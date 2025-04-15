import {Folder} from "../../../api/Models/Folder.ts";
import {File} from "../../../api/Models/File.ts";
import {useEffect, useState,} from "react";
import {fetchFileBlob, fetchFileSystem} from "../../../api/fetchs/FileSystemApi.ts";
import './FileSystemBrowser.css';



export default function FileSystemBrowser() {
  const [currentDirectory, setCurrentDirectory] = useState<number>(9);
  const [fileSystem, setFileSystem] = useState<{ folders: Folder[]; files: File[] }>({
    folders: [],
    files: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Folder[]>([]);

  useEffect(() => {
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
        : 9;
      setCurrentDirectory(parentFolder);
    }
  };
const handleDownload = async (file: File) => {
  try {
    const blob = await fetchFileBlob(file.file); // file.file = "/uploads/uploads/tochnost.png"

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
}
  const navigateToBreadcrumb = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentDirectory(newBreadcrumbs[index].id);
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  const api_url = "http://localhost:8000"
  return (
    <div className="file-system-browser">
      <div className="breadcrumbs">
        <button onClick={navigateUp} disabled={breadcrumbs.length === 0}>
          ↑ Наверх
        </button>
        <span
          onClick={() => {
            setBreadcrumbs([]);
            setCurrentDirectory(9);
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
                style={{ cursor: 'pointer' }}
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
                  href={api_url+ file.file}

                  rel="noopener noreferrer"
                  download
                >
                  📄 {decodeURIComponent(file.file.split('/').pop())}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
