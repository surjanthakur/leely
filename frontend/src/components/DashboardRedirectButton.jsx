import './DashboardButton.css';
import { useNavigate } from 'react-router-dom';
import { Messages3 } from 'reicon-react';

export default function DashboardRedirectButton() {
  const navigate = useNavigate();

  const handleClick = async (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <>
      <button type="button" onClick={handleClick} className="button">
        open Dashboard
        <Messages3 size={24} />
      </button>
    </>
  );
}
