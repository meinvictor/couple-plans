import React, { useMemo } from "react";
import "./Starfield.css";

const generateBoxShadows = (count, maxX, maxY) => {
  const positions = [];
  for (let i = 0; i < count; i += 1) {
    const x = Math.floor(Math.random() * maxX);
    const y = Math.floor(Math.random() * maxY);
    positions.push(`${x}px ${y}px #FFF`);
  }
  return positions.join(", ");
};

const StarLayer = ({ sizePx, count, durationMs }) => {
  const boxShadow = useMemo(() => generateBoxShadows(count, 2000, 2000), [count]);

  return (
    <>
      <div
        className="star-layer"
        style={{ width: sizePx, height: sizePx, boxShadow, animationDuration: `${durationMs}ms` }}
      />
      <div
        className="star-layer star-layer-duplicate"
        style={{ width: sizePx, height: sizePx, boxShadow, animationDuration: `${durationMs}ms` }}
      />
    </>
  );
};

const Starfield = () => {
  return (
    <div className="starfield" aria-hidden>
      <StarLayer sizePx={1} count={700} durationMs={50000} />
      <StarLayer sizePx={2} count={200} durationMs={100000} />
      <StarLayer sizePx={3} count={100} durationMs={150000} />
    </div>
  );
};

export default Starfield;


