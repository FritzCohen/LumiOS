import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./lib.css";
import Button from "./Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

interface DatePickerPopupProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement>;
}

const DatePicker: React.FC<DatePickerPopupProps> = ({
  value,
  onChange,
  onClose,
  anchorRef,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

  const initialDate = value ? new Date(value) : new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [currentMonth, setCurrentMonth] = useState<Date>(initialDate);
  const [hour, setHour] = useState(initialDate.getHours());
  const [minute, setMinute] = useState(initialDate.getMinutes());
  const [ampm, setAmPm] = useState(initialDate.getHours() >= 12 ? "PM" : "AM");

  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Calculate position from the anchorRef
  useLayoutEffect(() => {
    if (anchorRef.current && popupRef.current) {
      const anchorRect = anchorRef.current.getBoundingClientRect();
      const parentRect =
        anchorRef.current.offsetParent?.getBoundingClientRect() || {
          top: 0,
          left: 0,
          width: 100,
          height: 100,
        };

      const top = (anchorRect.bottom) - parentRect.top + popupRef.current.getBoundingClientRect().height/2;
      const left = (anchorRect.left + parentRect.width/2) - parentRect.left;      

      setPosition({ top, left });
    }
  }, [anchorRef]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        !anchorRef.current?.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, anchorRef]);

  // Utility functions
  const handleDateSelect = (date: Date) => {
    const updated = new Date(date);
    updated.setHours(hour);
    updated.setMinutes(minute);
    setSelectedDate(updated);
    onChange(updated.toISOString());
  };

  const handleTimeChange = (newHour: number, newMinute: number) => {
    setHour(newHour);
    setMinute(newMinute);
    const updated = new Date(selectedDate);
    updated.setHours(newHour);
    updated.setMinutes(newMinute);
    setSelectedDate(updated);
    onChange(updated.toISOString());
  };

  const setToday = () => {
    const now = new Date();
    setSelectedDate(now);
    setCurrentMonth(now);
    setHour(now.getHours());
    setMinute(now.getMinutes());
    setAmPm(now.getHours() >= 12 ? "PM" : "AM");
    onChange(now.toISOString());
  };

  // Calendar generation
  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const prevMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  const nextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );

  const renderDays = () => {
    const totalDays = daysInMonth(
      currentMonth.getFullYear(),
      currentMonth.getMonth()
    );
    const days: JSX.Element[] = [];
    const blanks = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    for (let i = 0; i < blanks; i++) {
      days.push(<div key={`b${i}`} className="day blank"></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
      const day = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        d
      );
      const isSelected = selectedDate.toDateString() === day.toDateString();
      const isToday = new Date().toDateString() === day.toDateString();
      days.push(
        <button
          key={d}
          className={`day ${isSelected ? "selected" : ""} ${
            isToday ? "today" : ""
          }`}
          onClick={() => handleDateSelect(day)}
        >
          {d}
        </button>
      );
    }

    return days;
  };

  const monthName = currentMonth.toLocaleString("default", { month: "long" });
  const year = currentMonth.getFullYear();

  return (
    <div
      ref={popupRef}
      className="datepicker-popup"
      style={{ top: position.top, left: position.left }}
    >
      <div className="datepicker-header">
        <button className="nav-btn" onClick={prevMonth}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <span className="month-label">
          {monthName} {year}
        </span>
        <button className="nav-btn" onClick={nextMonth}>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      <div className="weekdays">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="weekday">
            {d}
          </div>
        ))}
      </div>

      <div className="days-grid">{renderDays()}</div>

      {/* Time Picker - Two Rows */}
      <div className="time-picker two-rows">
        <div className="time-row">
          <input
            type="number"
            min="1"
            max="12"
            value={hour % 12 === 0 ? 12 : hour % 12}
            onChange={(e) => {
              let newHour = Number(e.target.value);
              if (ampm === "PM" && newHour < 12) newHour += 12;
              if (ampm === "AM" && newHour === 12) newHour = 0;
              handleTimeChange(newHour, minute);
            }}
            className="time-input"
          />
          <span className="time-sep">:</span>
          <input
            type="number"
            min="0"
            max="59"
            value={minute.toString().padStart(2, "0")}
            onChange={(e) => handleTimeChange(hour, Number(e.target.value))}
            className="time-input"
          />
        </div>

        <div className="time-row">
          <select
            value={ampm}
            onChange={(e) => {
              const newValue = e.target.value as "AM" | "PM";
              setAmPm(newValue);
              let newHour = hour;
              if (newValue === "PM" && hour < 12) newHour += 12;
              if (newValue === "AM" && hour >= 12) newHour -= 12;
              handleTimeChange(newHour, minute);
            }}
            className="ampm-select"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
          <Button className="!py-0 today-btn" onClick={setToday}>
            Today?
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DatePicker;