import React from "react";
import { ReactComponent as ButtonBackground } from "./button.svg";

export function StandardButton({
  children,
  onClick,
  className = "",
}: {
  children: string;
  onClick: () => any;
  className?: string;
}) {
  return (
    <>
      <button className={"standard-button " + className} onClick={onClick}>
        <div className="text-opacity">{children}</div>
        <ButtonBackground />
      </button>
    </>
  );
}
