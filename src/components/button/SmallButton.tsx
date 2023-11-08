import React from "react";
import { ReactComponent as ButtonBackground } from "./small-button.svg";

export function SmallButton({
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
        {children}
        <ButtonBackground />
      </button>
    </>
  );
}
