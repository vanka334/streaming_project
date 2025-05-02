import React, {useEffect, useState} from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {Project} from "../../../../api/Models/Project.ts";
import {Task} from "../../../../api/Models/Task.ts";
import {useParams} from "react-router-dom";
import {fetchTasks} from "../../../../api/fetchs/taskApi.ts";
import {fetchProject} from "../../../../api/fetchs/ProjectApi.ts";

const COLORS = ["#00C49F", "#FF8042", "#FFBB28", "#8884d8"];

const ProjectDashboard: React.FC = () => {
  const API = import.meta.env.VITE_API_DOWNLOAD_URL;
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const projectData = await fetchProject(Number(projectId));
        const allTasks = await fetchTasks();
        const filteredTasks = allTasks.filter((t) => t.project === Number(projectId));
        setProject(projectData);
        setTasks(filteredTasks);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  if (loading) return <div className="p-4">Загрузка...</div>;
  if (!project) return <div className="p-4">Проект не найден.</div>;

  // Generate pieData from statistics.status_distribution
  const pieData = project.statistics?.status_distribution
    ? Object.entries(project.statistics.status_distribution).map(([name, value]) => ({
        name,
        value
      }))
    : [];

  const efficiency = project.statistics?.kpi
    ? project.statistics.kpi
    : 0;

  return (
    <div className="p-4 space-y-6">
      {/* Описание проекта */}
      <div className="bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
        <p className="text-gray-600">{project.description}</p>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="text-xl font-semibold mb-4">Статус задач</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow rounded-xl p-4 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold mb-2">Эффективность</h2>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div
              className="bg-blue-500 h-4 rounded-full"
              style={{ width: `${efficiency}%` }}
            />
          </div>
          <span className="text-gray-700 font-medium">{efficiency}%</span>
        </div>
      </div>

      {/* Участники */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-4">Участники</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {project.users_detail?.map((user) => (
            <a
              key={user.id}
              href={`/user/${user.id}`}
              className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg p-2 transition"
            >
              <img
                src={API + user.avatar || "/default-avatar.png"}
                alt={`${user.name} ${user.surname}`}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">{`${user.surname || ""} ${user.name || ""}`}</p>
                <p className="text-gray-500 text-sm">{user.email}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;