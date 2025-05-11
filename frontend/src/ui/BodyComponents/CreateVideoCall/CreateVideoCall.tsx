import { useEffect, useState } from 'react';
// твой метод
import axios from 'axios';
import {fetchUsers, fetchUsersDepartments} from "../../../api/fetchs/userApi.ts";
import {User} from "../../../api/Models/User.ts";
import {VideoRoom} from "./VideoRoom/VideoRoom.tsx";
import './CreateVideoCall.css';
import api from "../../../api/interceptors.ts";



interface CreateVideoCallProps {
  subject?: string;
}

export function CreateVideoCall(props: CreateVideoCallProps) {
  const { subject: initialSubject } = props;
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [callId, setCallId] = useState<number | null>(null);
  const [subject, setSubject] = useState<string>(initialSubject || '');

  useEffect(() => {
    const load = async () => {
      const allUsers = await fetchUsersDepartments();
      setUsers(allUsers);
    };
    load();
  }, []);

  const toggleUser = (userId: number) => {
    setSelected(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const createCall = async () => {
    const res = await api.post('/video/create/', {
      participants: selected,
      title: subject || undefined,

    });
    setCallId(res.data.call_id);
  };

  if (callId){const callUrl = `${window.location.origin}/videocall/${callId}`; // путь к звонку
  window.open(callUrl, '_blank');}

  // Группировка по департаментам
  const groupedUsers = new Map<string, User[]>();
  const noDepartment: User[] = [];

  users.forEach(user => {
    const userDepartments = user.departments;

    if (!userDepartments || userDepartments.length === 0) {
      noDepartment.push(user);
    } else {
      userDepartments.forEach(dep => {
        const depName = dep.name || 'Неизвестный департамент';
        if (!groupedUsers.has(depName)) {
          groupedUsers.set(depName, []);
        }
        groupedUsers.get(depName)!.push(user);
      });
    }
  });

  return (
      <div className="call-wrapper">
        <h3>Создать видеозвонок</h3>

        <input
            className="call-subject"
            type="text"
            placeholder="Введите тему звонка"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
        />

        {[...groupedUsers.entries()].map(([depName, users]) => (
            <div key={depName} className="department-block">
              <h4>{depName}</h4>
              {users.map(user => (
                  <div key={`${user.id}-${depName}`} className="user-item">
                    <div className="user-details">
                      <img
                          src={user.avatar || '/default-avatar.png'}
                          alt="avatar"
                          className="user-avatar"
                      />
                      <span>
                {user.surname || ''} {user.name || ''} {user.patronymic || ''}
              </span>
                    </div>
                    <input
                        type="checkbox"
                        checked={selected.includes(user.id)}
                        onChange={() => toggleUser(user.id)}
                    />
                  </div>
              ))}
            </div>
        ))}

        {noDepartment.length > 0 && (
            <div className="department-block">
              <h4>Без департамента</h4>
              {noDepartment.map(user => (
                  <div key={user.id} className="user-item">
                    <div className="user-details">
                      <img
                          src={user.avatar || '/default-avatar.png'}
                          alt="avatar"
                          className="user-avatar"
                      />
                      <span>
                {user.surname || ''} {user.name || ''} {user.patronymic || ''}
              </span>
                    </div>
                    <input
                        type="checkbox"
                        checked={selected.includes(user.id)}
                        onChange={() => toggleUser(user.id)}
                    />
                  </div>
              ))}
            </div>
        )}

        <button onClick={createCall} disabled={selected.length === 0} className="start-call-btn">
          🎥 Начать звонок
        </button>
      </div>
  );
}