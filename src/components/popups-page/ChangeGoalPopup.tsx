import React, { Fragment } from "react";

import { Dialog, Transition } from "@headlessui/react";
import { Action, AppState } from "../../Types";
import { SmallButton } from "../button/SmallButton";
import "./popup.css";
import { SegmentedControl } from "./segmented-control/SegmentedControl";
import { SliderSelect } from "./segmented-control/SelectorView";
import { Exit } from "./Exit";

export function ChangeGoalPopup({
  state,
  isOpen,
  onClose,
  dispatch,
}: {
  state: AppState;
  isOpen: boolean;
  onClose: () => any;
  dispatch: React.Dispatch<Action>;
}) {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="background"></div>
      <div className="grid-popup">
        <div className="left-popup">
          <Dialog.Title as="h1" className="heading-popup">
            CHANGE GOAL
          </Dialog.Title>
        </div>
        <Dialog.Panel
          className="middle-popup"
          onCopy={(e) => e.stopPropagation()}
        >
          <h2 className="label-popup">difficulty</h2>
          <div className="section-grid">
            <div>
              <div className="popup-text">
                The number determines the minimum amount of moves the scramble
                can be solved in. For 1 and 2 move scrambles, the keyboard
                trainer will teach you them as you learn the keybindings for the
                virtual cube (work in progress).
              </div>
            </div>
            <SegmentedControl>
              <SliderSelect
                {...{ state, dispatch, select: "fbLevelSelector" }}
              />
            </SegmentedControl>
          </div>
        </Dialog.Panel>
        <Exit/>
      </div>
    </Dialog>
  );
}
