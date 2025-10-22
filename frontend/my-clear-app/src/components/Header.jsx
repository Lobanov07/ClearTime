import { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import "../styles/header.css";

function Header({ onCreateClick }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("access"));
  }, []);

  const handleAvatarClick = () => {
    if (!isLoggedIn) {
      setIsLoginOpen(true);
    } else {
      setUserMenuOpen(prev => !prev);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username")
    window.location.reload();
  };

  return (
    <header className="header">
      <h1 className="logo">ClearTime</h1>
      <div className="header-actions">
        {isLoggedIn && (<button className="create-btn" onClick={onCreateClick}>+ Создать задачу</button>)}
        <div className="user-avatar" onClick={handleAvatarClick}>{localStorage.getItem("username")}</div>

        {userMenuOpen && (
          <div className="user-menu">
            <button onClick={handleLogout}>Выйти</button>
          </div>
        )}

        {isLoginOpen && (
          <div className="modal-overlay" onClick={() => setIsLoginOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <LoginForm
                onSuccess={() => {
                  setIsLoginOpen(false);
                  setIsLoggedIn(true);
                  window.location.reload();
                }}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;