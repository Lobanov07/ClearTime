function Slider({ items }) {
  return (
    <div className="slider-container">
      {items.map((item, index) => (
        <div key={index} className="slider-item">
          <div className="slider-title">{item.title}</div>
          <div className="slider-text">{item.text}</div>
        </div>
      ))}
    </div>
  );
}

export default Slider;
