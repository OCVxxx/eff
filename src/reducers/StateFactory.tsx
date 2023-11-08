
// import { FbdrStateM, FbStateM, FsStateM, FsDrStateM, FbssStateM} from './BlockTrainerStateM';
// import { SsStateM } from './SsStateM';
// import { EOLRStateM, LSEStateM } from './LSETrainerStateM';
// import { SolvedStateM, SolvingStateM } from './CmllStateM';

import { AppState, Mode } from "../Types";
import { StateFactory } from "./AbstractStateM";
import { FbStateM } from "./BlockTrainerStateM";
import { CrossStateM } from "./CfStateM";

StateFactory.create = function(state: AppState) {
        let mode: Mode = state.mode;
        switch (mode) {
            case "cross":
                return new CrossStateM(state);
        }
        ;
    }

export { StateFactory };