import React from "react";
import { ReactComponent as Background } from "./background-glow.svg";

export function SegmentedControl({
  children,
}: {
  children: React.JSX.Element;
}) {
  return (
    <>
      <div className="controls">
        <Background /> {children}
      </div>
    </>
  );
}
