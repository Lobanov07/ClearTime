import "../styles/filter.css";
import { useMemo } from "react";

export default function FilterBar({ filters, onChange }) {
    const urgencyOptions = useMemo(() => ([
        { key: "all", label: "Все" },
        { key: "urgent", label: "Срочно" },
        { key: "normal", label: "Нормально" },
        { key: "low", label: "Неважно" }
    ]), []);

    const dateOptions = useMemo(() => ([
        { key: "all", label: "Все" },
        { key: "with", label: "С датой" },
        { key: "without", label: "Без даты" }
    ]), []);

    const handleUrgency = (key) => onChange({ ...filters, urgency: key });
    const handleDate = (key) => onChange({ ...filters, hasDate: key });

    return (
        <div className="filterbar">
            <div className="filter-group">
                <div className="filter-label">Срочность</div>
                <div className="segmented">
                    {urgencyOptions.map(opt => (
                        <button
                            key={opt.key}
                            className={`segment ${filters.urgency === opt.key ? "active" : ""}`}
                            onClick={() => handleUrgency(opt.key)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="filter-group">
                <div className="filter-label">Дата</div>
                <div className="segmented">
                    {dateOptions.map(opt => (
                        <button
                            key={opt.key}
                            className={`segment ${filters.hasDate === opt.key ? "active" : ""}`}
                            onClick={() => handleDate(opt.key)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}


