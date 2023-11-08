import React, { useState } from "react";
import { Action, AppState } from "../../Types";
import { ChangeGoalPopup } from "../popups-page/ChangeGoalPopup";
import { SettingsPopup } from "../popups-page/SettingsPopup";
import { StandardButton } from "./StandardButton";
import "./button.css";

export function ButtonsSection(props: {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}) {
  let { state, dispatch } = props;

  let [settings, showSettings] = useState(false);
  let [changGoal, showChangeGoal] = useState(false);
  // let [statsPlus, showStatsPlus] = useState(false);

  return (
    <>
      <StandardButton
        className="main-button"
        onClick={() => showChangeGoal(true)}
      >
        {"Change Goal"}
      </StandardButton>
      <StandardButton
        className="main-button"
        onClick={() => showSettings(true)}
      >
        {"Settings"}
      </StandardButton>

      <div>
        <SettingsPopup
          state={state}
          dispatch={dispatch}
          isOpen={settings}
          onClose={() => showSettings(false)}
        />
        <ChangeGoalPopup
          state={state}
          isOpen={changGoal}
          onClose={() => showChangeGoal(false)}
          dispatch={dispatch}
        />
      </div>
    </>
  );
}
