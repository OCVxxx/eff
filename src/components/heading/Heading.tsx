import React from "react";
import "./heading.css";

type heading = { content: string; className?: string };

export function Heading({
  headings,
  gridClass,
}: {
  headings: heading[];
  gridClass?: string;
}) {
  let headingCells = headings.map((h) => (
    <h1 className={h.className ? h.className : undefined}>{h.content}</h1>
  ));

  return <div className={gridClass}>{headingCells}</div>;
}
