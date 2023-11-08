import { CubeUtil, CubieCube, Mask } from "../lib/CubeLib";
import { BuildStateM, allPremoves } from "./BuildStateM";

export class CrossStateM extends BuildStateM {
  solverL: number = 8;
  solverR: number = 11;
  // premoves = ["", "x", "x'", "x2"];
  premoves = allPremoves;

  levelMaxAttempt = 2000;

  isSolved(cube: CubieCube) {
    return CubeUtil.is_fb_solved(cube);
  }

  _get_random(): [CubieCube, string] {
    let mask = Mask.empty_mask;
    let cube = CubeUtil.get_random_with_mask(mask);
    let solver = "cross";

    return [cube, solver];
  }
  getLevelSelector() {
    return this.state.config.fbLevelSelector;
  }
  getRandomAnyLevel() {
    let [cube, solver] = this._get_random();
    return {
      cube,
      solvers: [solver],
      ssolver: "cross-fixed",
    };
  }
}
