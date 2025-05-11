import React, {useState, useEffect, lazy} from 'react';
import { Project } from '../../../api/Models/Project';
import { fetchProjects, deleteProject } from '../../../api/fetchs/ProjectApi';
import './ProjectPage.css';
import {ProjectModal} from "./ProjectModal/ProjectModal.tsx";
import {fetchIsManager} from "../../../api/fetchs/userApi.ts";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isManager, setIsManager] = useState<boolean>(false);
  const currentUserId = localStorage.getItem('user_id');
  const loadProjects = async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (err) {
      setError('Ошибка загрузки проектов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
const checkManagerStatus = async () => {
  const result = await fetchIsManager(parseInt(currentUserId));
  setIsManager(result['result']); // предполагаем, что API возвращает boolean
}
    loadProjects();
checkManagerStatus();
  }, [currentUserId]);

  const openCreateModal = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleSaveProject = (project: Project) => {
    setProjects(prev => {
      const index = prev.findIndex(p => p.id === project.id);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = project;
        return updated;
      } else {
        return [...prev, project];
      }
    });
  };

  const handleDeleteProject = async (projectId: number) => {
    try {
      await deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err) {
      console.error('Ошибка удаления проекта', err);
    }
  };

  if (loading) return <div>Загрузка проектов...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="projects-page">
      <h1>Проекты</h1>
      {isManager &&(
      <button onClick={openCreateModal} className="create-project-button">
        Создать проект
      </button>)}
      <div className="projects-list">
        {projects.length === 0 ? (
          <p>Нет проектов</p>
        ) : (
          projects.map(project => (
            <div key={project.id} className="project-card">
              <span> <img
                  src={project.avatar || '/default-avatar.png'}
                  alt="avatar"
                  className="user-avatar"
              /></span>
              <span> <a href={`/projects/${project.id}`}><h2>{project.name}</h2></a></span>
              <p>{project.description}</p>
              {isManager &&(
              <div className="project-actions">
                <button onClick={() => openEditModal(project)}>Редактировать</button>
                <button onClick={() => project.id && handleDeleteProject(project.id)}>
                  Удалить
                </button>
              </div>)}
            </div>
          ))
        )}
      </div>
      {isModalOpen && (
        <ProjectModal
          project={editingProject ?? undefined}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProject}
        />
      )}
    </div>
  );
}
