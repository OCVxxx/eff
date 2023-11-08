import React from "react";
import { AppState } from "../../Types";
import { Heading } from "../heading/Heading";

export function ScrambleView({ state }: { state: AppState }) {
  const desc = state.case.desc;
  const setup = desc.length ? desc[0].setup! : "";
  return (
    <>
      <Heading
        headings={[
          { content: "SCRAMBLE", className: "heading-left heading-scramble" },
        ]}
      />
      <div className="scramble-text">{setup}</div>
    </>
  );
}
