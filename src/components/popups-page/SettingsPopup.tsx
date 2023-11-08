import React from "react";
import { Action, AppState } from "../../Types";
import { StandardButton } from "../button/StandardButton";
import { SingleSelect } from "./segmented-control/SelectorView";
import { SmallButton } from "../button/SmallButton";
import { SegmentedControl } from "./segmented-control/SegmentedControl";
import { Dialog } from "@headlessui/react";
import { handleDialog } from "./StopPropagation";
import { Exit } from "./Exit";

export function SettingsPopup({
  state,
  dispatch,
  isOpen,
  onClose,
}: {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  isOpen: boolean;
  onClose: () => any;
}) {
  const desc = state.case.desc;
  const setup = desc.length ? desc[0].setup! : "";
  // if (!isOpen) return null;

  // return <ShowScramble state={state} />;
  return (
    <>
      <Dialog open={isOpen} onClose={onClose}>
        <div className="background"></div>
        <div className="grid-popup">
          <div className="left-popup">
            <Dialog.Title as="h1" className="heading-popup">
              SETTINGS
            </Dialog.Title>
          </div>
          <Dialog.Panel className="middle-popup">
            <h2 className="label-popup">show scramble</h2>
            <div className="section-grid">
              <div>
                <div className="popup-text">
                  The scramble will show at the top of the screen. The current
                  scramble is <span className="scramble">{setup}</span>.
                </div>
              </div>
              <SegmentedControl>
                <SingleSelect
                  state={state}
                  dispatch={dispatch}
                  select="showScramble"
                />
              </SegmentedControl>
            </div>
          </Dialog.Panel>
          <Exit />
        </div>
      </Dialog>
    </>
  );
}
