import Sidebar from "@components/Sidebar/Sidebar";
import Topbar from "@components/Topbar/Topbar";
import { useAppContext } from "../../context/AppContext";
import "./ComingSoon.css";

interface ComingSoonProps {
  title: string;
  description: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title, description }) => {
  const { currentUser, selectSpace } = useAppContext();

  return (
    <div className="coming-soon-page">
      <Topbar currentUser={currentUser} />
      <Sidebar spaces={currentUser?.spaces || []} onSpaceClick={selectSpace} />
      <div className="coming-soon-container">
        <div className="coming-soon-content">
          <div className="coming-soon-icon">🚧</div>
          <h1 className="coming-soon-title">{title}</h1>
          <p className="coming-soon-description">{description}</p>
          <div className="coming-soon-subtitle">Estamos trabajando en ello</div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
