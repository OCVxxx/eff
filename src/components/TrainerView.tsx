import React, { useEffect, useState } from "react";
import { Action, AppState, StateT } from "../Types";
import "./fonts/fonts.css";
import { FaceletCube, Mask } from "../lib/CubeLib";
import { Face } from "../lib/Defs";
import CubeSim from "./grid-components/CubeSim";
import { GoalView } from "./grid-components/GoalView";
import { ResultsView } from "./grid-components/ResultsView";
import { ScrambleView } from "./grid-components/ScrambleView";
import { Solutions } from "./grid-components/SolutionsView";
import { StatsView } from "./grid-components/StatsView";
import "./grid.css";
import "./spacing-and-positioning.css";
import { RawData } from "./stats-lib/RawData";
import "./text-styles.css";
import "./transitions.css";
import "./body.css";

function getMask(state: AppState): Mask {
  return Mask.cross_mask;
}

const initialData: RawData = { performances: [], numAttempts: 0 };

function TrainerView(props: {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}) {
  let { state, dispatch } = props;
  let [data, setData] = useState<RawData>(initialData);

  useEffect(() => {
    function downHandler(event: KeyboardEvent) {
      state.keyMapping.handle(event, dispatch);
    }
    window.addEventListener("keydown", downHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
    };
  });

  useEffect(() => {
    async function show() {
      setData(await state.result.getRawData());
    }

    show();

    state.result.watchData(setData);
  }, [state.result]);

  let scrambleContent = (
    <div
      className={
        "grid-template grid-scramble" +
        (props.state.config.showScramble.getActiveName() !== "Show"
          ? " hide-scramble"
          : "")
      }
    >
      <div className="left left-scramble">
        <ScrambleView state={state} />
      </div>
    </div>
  );

  let isRevealed = state.name === StateT.revealed;
  let isSolving = state.name === StateT.solving;

  let revealedContent = (
    <div className={"revealed-content" + (!isRevealed ? " fade" : "")}>
      {scrambleContent} hello
      <div className="grid-template grid-content">
        <div className="left top-left">
          <GoalView {...{ state, dispatch }} />
        </div>

        {/* <div className="move-count">{state.cube.history.length}</div> */}
        <div className="right">
          <Solutions state={state} />
        </div>
        <div className="left bottom-left">
          <StatsView data={data} />
          <ResultsView performances={data.performances} />
        </div>
      </div>
    </div>
  );

  let cube = state.cube.state;
  const scale = 2;
  const canvas_wh = [400 * scale, 350 * scale];

  let facelet = FaceletCube.from_cubie(cube, getMask(state));

  let cubeContent = (
    <div className="grid-template grid-cube">
      {props.state.config.showCube.getActiveName() === "Show" ? (
        <CubeSim
          width={canvas_wh[0]}
          height={canvas_wh[1]}
          cube={facelet}
          colorScheme={state.colorScheme.getColorsForOri(state.cube.ori)}
          hintDistance={70}
          theme={state.config.theme.getActiveName()}
          facesToReveal={[Face.L, Face.B, Face.D]}
        />
      ) : null}
    </div>
  );

  let inspection = (
    <div className="inspection-container">
      <h1 className={"heading-inspection" + (isRevealed || isSolving ? " fade" : "")}>
        INSPECTION
      </h1>
    </div>
  );

  return (
    <>
      {inspection}
      {cubeContent}
      {revealedContent}
    </>
  );
}

export default TrainerView;
