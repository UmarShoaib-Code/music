import { Outlet, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../admin.css';

function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/users/logout`, {}, { 
        withCredentials: true 
      });
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div>
      <nav className="admin-nav">
        <h1 className="admin-nav-brand">Admin Panel</h1>
        <ul className="admin-nav-list">
          <li><Link to="/admin" className="admin-nav-link">Dashboard</Link></li>
          <li>
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </nav>
      <div className="admin-content-wrapper">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;