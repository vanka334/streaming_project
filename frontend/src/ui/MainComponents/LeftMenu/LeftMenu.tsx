import './LeftMenu.css';

 const LeftMenu = () => (
  <aside className="sidebar">
    <ul className="menu">
      <li className="menuItem">
        <a href="/dashboard" className="menuLink active">Дашборд</a>
      </li>
      <li className="menuItem">
        <a href="/projects" className="menuLink">Проекты</a>
      </li>
    </ul>
  </aside>
)
export default LeftMenu;