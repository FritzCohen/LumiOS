// COPY AND PASTED FROM LAST LUMI OS VERSION
// EVERY FILE HAD AN ERROR.
// ILL FIX IT LATER MAYBE PROBABLY NOT DEFINITELY NOT

import React, { useEffect, useState } from "react";

const Battery = () => {
  const [batteryLevel, setBatteryLevel] = useState(0);

  useEffect(() => {
    const updateBatteryLevel = async () => {
      try {
        const battery = await navigator.getBattery();
        setBatteryLevel(Math.round(battery.level * 100));
      } catch (error) {
        // navigator.getBattery() is not supported
        console.error("Battery API not supported:", error);
        // Set battery level to 50% when not supported
        setBatteryLevel(50);
      }
    };

    // Initial update
    updateBatteryLevel();

    // Add an event listener for future updates
    if (navigator.getBattery) {
      navigator.getBattery().then((battery) => {
        battery.addEventListener("levelchange", updateBatteryLevel);
      });
    }

    // Clean up the event listener on component unmount
    return () => {
      if (navigator.getBattery) {
        navigator.getBattery().then((battery) => {
          battery.removeEventListener("levelchange", updateBatteryLevel);
        });
      }
    };
  }, []);

  const getChargingBarWidth = () => {
    // Calculate the width of the charging bar based on the battery level
    return `${Math.max(0, Math.min(100, batteryLevel))}%`;
  };

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24"
        width="28"
        viewBox="0 0 576 512"
        className="invert"
      >
        <path
          fill="#000000"
          d="M80 160c-8.8 0-16 7.2-16 16V336c0 8.8 7.2 16 16 16H464c8.8 0 16-7.2 16-16V176c0-8.8-7.2-16-16-16H80zM0 176c0-44.2 35.8-80 80-80H464c44.2 0 80 35.8 80 80v16c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32v16c0 44.2-35.8 80-80 80H80c-44.2 0-80-35.8-80-80V176z"
        />
        <rect
          x="80"
          y="192"
          width={getChargingBarWidth()}
          height="128"
          fill="#000000"
        />
      </svg>
    </>
  );
};

export default Battery;