import { DefaultKeyMapping } from "../KeyMapping";
import { AppState, Mode, StateT } from "../Types";
import { ResultsApp } from "../components/stats-lib/ResultsApp";
import { ColorScheme, CubieCube } from "../lib/CubeLib";
import { getConfig, getFavList } from "../lib/LocalStorage";
import { StateFactory } from "./AbstractStateM";

export const getPreState = (mode?: Mode): AppState => {
  mode = mode || "cross";
  let initialStateName: StateT = (function () {
    switch (mode) {
      case "cross":
        return StateT.revealed;
    }
  })();
  let ori = getConfig().orientationSelector.getActiveName() || "YR";
  return {
    name: initialStateName,
    mode,
    scrambleInput: [],
    cube: {
      state: new CubieCube(),
      ori,
      history: [],
      levelSuccess: true,
      prevState: null
    },
    case: {
      state: new CubieCube(),
      desc: [],
    },
    prev: null,
    config: getConfig(),
    favList: getFavList(),
    keyMapping: new DefaultKeyMapping(),
    colorScheme: new ColorScheme(),
    prevSol: [],
    result: new ResultsApp(),
    max: 100,
  };
};

export const getInitialState = (mode?: Mode): AppState =>
  StateFactory.create(getPreState(mode)).onInitial();

// export const getInitialState = getPreState
