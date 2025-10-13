import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserStats } from "@/api/users";
import type { User } from "@/types/user";
import "./UserInfoModal.css";

interface UserInfoModalProps {
  user: User | null | undefined;
  isLoading?: boolean;
  onClose: () => void;
}

function UserInfoModal({ user, isLoading = false, onClose }: UserInfoModalProps) {
  const navigate = useNavigate();
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Close on ESC
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const fullName = useMemo(() => {
    if (!user) return "";
    return `${user.name ?? ""} ${user.last_name ?? ""}`.trim();
  }, [user]);

  const initials = useMemo(() => {
    if (!fullName) return "";
    const parts = fullName.split(" ").filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  }, [fullName]);

  const spacesCount = user?.spaces ? user.spaces.length : 0;

  // Fetch user stats using centralized function
  useEffect(() => {
    const fetchUserStats = async () => {
      if (user?.id) {
        try {
          setIsLoadingStats(true);
          const stats = await getUserStats(user.id);
          setTotalPosts(stats.totalPosts);
          setTotalComments(stats.totalComments);
        } catch (error) {
          console.error('Error fetching user stats:', error);
        } finally {
          setIsLoadingStats(false);
        }
      }
    };

    fetchUserStats();
  }, [user?.id]);

  const handleGoToProfile = () => {
    if (user?.id) {
      navigate(`/users/${user.id}`);
      onClose();
    }
  };

  const handleSpaceClick = (spaceId: number) => {
    if (spaceId) {
      navigate(`/space/${spaceId}`);
    }
  };

  return (
    <div className="user-info-overlay" onClick={onClose}>
      <div className="user-info-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`Información de ${fullName || "usuario"}`}>
        <button className="user-info-close-btn" aria-label="Cerrar" onClick={onClose}>
          ×
        </button>

        <div className="user-info-header">
          <div className="user-info-avatar-wrap">
            {user?.image ? (
              <img src={user.image} alt={fullName} className="user-info-avatar" />
            ) : (
              <div className="user-info-avatar-fallback" aria-hidden>
                {initials}
              </div>
            )}
          </div>
          <div className="user-info-ident">
            <h2 className="user-info-name">{fullName || "Usuario"}</h2>
            {user?.email && <p className="user-info-email">{user.email}</p>}
          </div>
        </div>

        <div className="user-info-body">
          {isLoading ? (
            <div className="user-info-loading">
              <div className="user-info-spinner" />
              <p>Cargando información...</p>
            </div>
          ) : !user ? (
            <div className="user-info-error">
              <p>No se pudo cargar la información del usuario.</p>
            </div>
          ) : (
            <>
              <div className="user-info-stats">
                <div className="user-info-stat">
                  <span className="user-info-stat-number">{isLoadingStats ? '...' : totalPosts}</span>
                  <span className="user-info-stat-label">Posts</span>
                </div>
                <div className="user-info-stat">
                  <span className="user-info-stat-number">{isLoadingStats ? '...' : totalComments}</span>
                  <span className="user-info-stat-label">Comentarios</span>
                </div>
                <div className="user-info-stat">
                  <span className="user-info-stat-number">{spacesCount}</span>
                  <span className="user-info-stat-label">Spaces</span>
                </div>
              </div>

              {user?.spaces && user.spaces.length > 0 && (
                <div className="user-info-spaces">
                  <h3 className="user-info-section-title">Spaces donde participa</h3>
                  <div className="user-info-space-chips">
                    {user.spaces.slice(0, 6).map((s) => (
                      <span key={s.id} className="user-info-space-chip" title={s.name} onClick={() => handleSpaceClick(s.id)}>
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="user-info-footer">
          <button className="user-info-secondary-btn" onClick={onClose}>Cerrar</button>
          <button className="user-info-primary-btn" onClick={handleGoToProfile} disabled={!user?.id}>Ver perfil</button>
        </div>
      </div>
    </div>
  );
}

export default UserInfoModal;
