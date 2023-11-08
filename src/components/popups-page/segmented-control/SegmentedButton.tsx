import React from "react";
import { ReactComponent as Separator } from "./separator.svg";

import { ReactComponent as ButtonBackgroundSmall } from "./sizes/selected-glow-small.svg";
import { ReactComponent as ButtonBackgroundBig } from "./sizes/selected-glow-big.svg";
import { ReactComponent as IndicatorSmall } from "./sizes/hover-indicator-small.svg";
import { ReactComponent as IndicatorBig } from "./sizes/hover-indicator-big.svg";


export function SegmentedButton({
  children,
  onClick,
  className = "",
  isActive,
  unique,
  isSmall,
}: {
  children: string;
  onClick: () => any;
  className?: string;
  isActive: boolean;
  unique?: string | number;
  isSmall: boolean;
}) {
  return (
    <div key={unique} className="segment">
      <button
        key={unique}
        className={
          "segmented-button " +
          (isActive ? "selected " : "unselected ") +
          (isSmall ? "button-small" : "button-big")
        }
        onClick={onClick}
      >
        <Separator />
        {isSmall? <><ButtonBackgroundSmall /><IndicatorSmall /></> : <><ButtonBackgroundBig /><IndicatorBig /></>}
        {children}
      </button>
    </div>
  );
}
