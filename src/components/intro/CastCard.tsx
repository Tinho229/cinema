
"use client";

import GlassCard from "./GlassCard";

const actors = [
  "XXX XXX",
  "XXX XXX",
  "XXX XXX",
];

export default function CastCard() {
  return (
    <GlassCard className="cast-card">
      <div className="cast-header">
        <span className="cast-number">02</span>

        <div>
          <p className="cast-overline">
            THE CAST
          </p>

          <h2>Acteurs principaux</h2>
        </div>
      </div>

      <div className="cast-list">
        {actors.map((actor, index) => (
          <div
            className="cast-person"
            key={`${actor}-${index}`}
          >
            <span className="cast-person-index">
              0{index + 1}
            </span>

            <span>{actor}</span>

            <span className="cast-arrow">↗</span>
          </div>
        ))}
      </div>

      <div className="cast-footer">
        <span>STARRING</span>
        <span>MAIN CAST</span>
      </div>
    </GlassCard>
  );
}