import './LeftMenu.css';
import {Link, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {fetchIsManager, fetchUserData} from "../../../api/fetchs/userApi.ts";
import {User} from "../../../api/Models/User.ts";

 const LeftMenu = () =>
 {const API = import.meta.env.VITE_API_DOWNLOAD_URL;
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isManager, setIsManager] = useState<boolean>(false);
  const currentUserId = localStorage.getItem('user_id');

     useEffect(() => {
         const checkManagerStatus = async () => {
         const result = await fetchIsManager(parseInt(currentUserId));
         setIsManager(result['result']); // предполагаем, что API возвращает boolean
         }
         const loadUserData = async () => {
             try {
        if (userId) {
          const userData = await fetchUserData(Number(userId));
          setUser(userData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
    checkManagerStatus();
  }, [userId]);


     return(
  <aside className="sidebar">
      <ul className="menu">
          <li className="menuItem">
              <Link to="/tasks" className={`menuLink ${location.pathname === '/tasks' ? 'active' : ''}`}>
                  Задачи
              </Link>
          </li>
          <li className="menuItem">
              <Link to="/filesystem" className={`menuLink ${location.pathname === '/filesystem' ? 'active' : ''}`}>
                  Файловая система
              </Link>
          </li>
          <li className="menuItem">
              <Link to="/projects" className={`menuLink ${location.pathname === '/projects' ? 'active' : ''}`}>
                  Проекты
              </Link>
          </li>
          <li>
              <Link to={"/user/" + currentUserId} className={`menuLink ${location.pathname === '/user/' ? 'active' : ''}`}>Профиль</Link>
          </li>
          <li className="menuItem">
              <Link
                 to="/videocall"

                  className={`menuLink ${location.pathname === '/videocall' ? 'active' : ''}`}
              >
                  Видеозвонок
              </Link>
          </li>
          {isManager == true &&(
          <li className="menuItem">
              <Link
                  to="/invite"

                  className={`menuLink ${location.pathname === '/invite' ? 'active' : ''}`}
              >
                  Создать приглашение
              </Link>
          </li>)}

      </ul>
  </aside>
     )
 }
export default LeftMenu;