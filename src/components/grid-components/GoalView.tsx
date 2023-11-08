import React from "react";
import { Action, AppState } from "../../Types";
import { ButtonsSection } from "../button/ButtonsSectionView";
import { Heading } from "../heading/Heading";

export function GoalView({
  state,
  dispatch,
}: {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}) {
  return (
    <>
      <Heading
        headings={[{ content: "GOAL", className: "heading-left heading-goal" }]}
      />
      <div className="goal-text">Solve the White Cross</div>
      <ButtonsSection {...{ state, dispatch }} />
    </>
  );
}
