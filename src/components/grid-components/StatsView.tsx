import React from "react";
import { Heading } from "../heading/Heading";
import { RawData } from "../stats-lib/RawData";
import { Stats } from "../stats-lib/Stats";

function updatedDisplayStats({ performances, numAttempts }: RawData) {
  const formattedStats = {
    mean3: Stats.formatPerformance(Stats.mean(Stats.lastN(performances, 3))),
    avg5: Stats.formatPerformance(
      Stats.trimmedAverage(Stats.lastN(performances, 5))
    ),
    avg12: Stats.formatPerformance(
      Stats.trimmedAverage(Stats.lastN(performances, 12))
    ),
    avg100: Stats.formatPerformance(
      Stats.trimmedAverage(Stats.lastN(performances, 100))
    ),
    rate3: Stats.formatPerformance(
      Stats.harmonicMean(
        Stats.lastN(performances, 3, { allowPartial: true }),
        3
      ),
      { partial: numAttempts < 3 }
    ), // TODO: avoid duplicate work
    rate5: Stats.formatPerformance(
      Stats.harmonicMean(
        Stats.lastN(performances, 5, { allowPartial: true }),
        5
      ),
      { partial: numAttempts < 5 }
    ), // TODO: avoid duplicate work
    rate12: Stats.formatPerformance(
      Stats.harmonicMean(
        Stats.lastN(performances, 12, { allowPartial: true }),
        12
      ),
      { partial: numAttempts < 12 }
    ), // TODO: avoid duplicate work
    rate100: Stats.formatPerformance(
      Stats.harmonicMean(
        Stats.lastN(performances, 100, { allowPartial: true }),
        100
      ),
      { partial: numAttempts < 100 }
    ), // TODO: avoid duplicate work
    best: performances.length > 0 ? Math.min(...performances) : "---",
    worst: performances.length > 0 ? Math.max(...performances) : "---",
    numAttempts: numAttempts, // TODO: exact number
  };
  return formattedStats;
  // this.statsView.setStats(formattedStats, attempts);
}

export function StatsView({ data }: { data: RawData }) {
  let formattedData = updatedDisplayStats(data);

  return (
    <>
      <Heading
        headings={[
          { content: "BESTS", className: "heading-left heading-bests" },
        ]}
      />
      <table className="stats-content">
        <tbody className="stats-text">
          <tr>
            <td className="stats-label">m3</td>
            <td>{formattedData?.mean3}</td>
          </tr>
          <tr>
            <td className="stats-label">a5</td>
            <td>{formattedData?.avg5}</td>
          </tr>
          <tr>
            <td className="stats-label">a12</td>
            <td>{formattedData?.avg12}</td>
          </tr>
          <tr>
            <td className="stats-label">a100</td>
            <td>{formattedData?.avg100}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
