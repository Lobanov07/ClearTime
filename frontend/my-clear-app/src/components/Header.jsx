import "../styles/header.css";

function Header({ onCreateClick }) {
  return (
    <header className="header">
      <h1 className="logo">ClearTime</h1>
      <div className="header-actions">
        <button className="create-btn" onClick={onCreateClick}> + Создать задачу</button>
        <div className="user-avatar"></div>
      </div>
    </header>
  );
}

export default Header;