import "./Filter.css";

export default function Filter({ onChange }) {
  return (
    <div className="filter-container">
      <select onChange={(e) => onChange(e.target.value)}>
        <option value="">Sort By</option>
        <option value="rating">⭐ Rating (High → Low)</option>
        <option value="name">🔤 Name (A → Z)</option>
      </select>
    </div>
  );
}