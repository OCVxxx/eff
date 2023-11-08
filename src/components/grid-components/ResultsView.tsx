import React from "react";
import { Heading } from "../heading/Heading";
import { Moves, Stats } from "../stats-lib/Stats";

export function ResultsView({ performances }: { performances: Moves[] }) {

  return performances ? (
    <>
      <Heading
        headings={[
          {
            content: "SINGLES",
            className: "heading-left heading-singles heading-results",
          },
          { content: "A5", className: "heading-results heading-a5" },
          { content: "A12", className: "heading-results heading-a12" },
        ]}
        gridClass="grid-results"
      />
      <table className="results-table">
        <tbody className="results-text">
          {performances.slice(0, 12).map((a, i) => (
            <tr key={i}>
              <td key={i}>{Stats.formatPerformance(a)}</td>
              <td>
                {Stats.performanceToAverage(
                  performances.slice(0 + i, 12 + i),
                  5
                )}
              </td>
              <td>
                {Stats.performanceToAverage(
                  performances.slice(0 + i, 12 + i),
                  12
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  ) : null;
}
