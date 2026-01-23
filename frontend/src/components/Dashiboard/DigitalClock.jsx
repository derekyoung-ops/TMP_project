import React, { useEffect, useState } from "react";

const DigitalClock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  const year = now.getFullYear();
  const month = now.toLocaleString("default", { month: "long" });
  const day = now.getDate();

  // 👉 Week of month calculation
  const firstDayOfMonth = new Date(year, now.getMonth(), 1).getDay();
  const weekOfMonth = Math.ceil((day + firstDayOfMonth) / 7);

  return (
    <div style={styles.clock}>
      <div style={styles.time}>{time}</div>
      <div style={styles.date}>
        {year} {month} {day} — Week {weekOfMonth}
      </div>
    </div>
  );
};

const styles = {
  clock: {
    textAlign: "right",
    color: "#1e88e5",
  },
  time: {
    fontSize: "32px",
    fontWeight: "600"
  },
  date: {
    fontSize: "20px",
    opacity: 0.85
  }
};

export default DigitalClock;
