import { Config } from "../Config";
import { AppState, FavCase, SliderOpt, StateT } from "../Types";
import { AttemptData, CaseDescMini } from "../components/stats-lib/AttemptData";
import { CaseDesc, alg_generator_from_group } from "../lib/Algs";
import { CachedSolver } from "../lib/CachedSolver";
import { CubieCube, MoveSeq } from "../lib/CubeLib";
import { Evaluator, SeqEvaluator } from "../lib/Evaluator";
import { arrayEqual, rand_choice } from "../lib/Math";
import { AbstractStateM, StateFactory } from "./AbstractStateM";

export const allPremoves = [
  "",
  "y",
  "y'",
  "y2",
  "x2",
  "x2y",
  "x2y'",
  "x2y2",
  "x",
  "xy",
  "xy'",
  "xy2",
  "x'",
  "x'y",
  "x'y'",
  "x'y2",
  "z",
  "zy",
  "zy'",
  "zy2",
  "z'",
  "z'y",
  "z'y'",
  "z'y2",
];

type RandomCubeT = {
  cube: CubieCube;
  solvers: string[];
  ssolver: string;
  failed?: boolean;
};

export abstract class BuildStateM extends AbstractStateM {
  abstract solverL: number;
  abstract solverR: number;
  scrambleMargin: number = 2;
  scrambleCount: number = 3;
  algDescWithMoveCount: string = "";
  expansionFactor = 5;
  premoves: string[] = [""];
  orientations: string[] = [""];
  evaluator: Evaluator;
  levelMaxAttempt = 1000;
  // [case, solver]
  abstract getRandomAnyLevel(): RandomCubeT;
  abstract isSolved(cube: CubieCube): Boolean;

  getLevelSelector(): SliderOpt | null {
    return null;
  }
  checkLevelConstraint(n: number): boolean {
    // default to true
    let slider = this.getLevelSelector();
    if (!slider) return true;
    // default to true
    // either slider at "ANY" or depth must match
    return (
      slider.value === slider.l - 1 ||
      slider.value === n ||
      (slider.value === slider.r && slider.value < n && !!slider.extend_r) ||
      (slider.value === slider.l && slider.value > n && !!slider.extend_l)
    );
  }
  levelConstraintOkayWithUpperBound(b: number): boolean {
    // default to true
    let slider = this.getLevelSelector();
    if (!slider) return true;
    // default to true
    // either slider at "ANY" or depth must match
    return (
      slider.value === slider.l - 1 ||
      slider.value >= b ||
      (slider.value === slider.r && !!slider.extend_r)
    );
  }
  getRandom(): RandomCubeT {
    for (let i = 0; i < this.levelMaxAttempt; i++) {
      let { cube, solvers, ssolver } = this.getRandomAnyLevel();
      const premoves = this.premoves || [""];
      let bound = Math.min(
        ...solvers
          .map((solver) =>
            premoves.map((pm) =>
              CachedSolver.get(solver).getPruners()[0].query(cube.apply(pm))
            )
          )
          .flat()
      );
      //console.log("bound estimate = ", bound, this.getLevelSelector()?.value, this.levelConstraintOkayWithUpperBound(bound))
      if (!this.levelConstraintOkayWithUpperBound(bound)) {
        continue;
      }
      let level = Math.min(
        ...solvers
          .map((solver) =>
            premoves.map(
              (pm) =>
                CachedSolver.get(solver).solve(
                  cube.apply(pm),
                  0,
                  this.solverR,
                  1
                )[0].moves.length
            )
          )
          .flat()
      );
      if (this.checkLevelConstraint(level)) {
        //TODO: add debug mode
        console.debug(`generated random state after ${i + 1} tries.`);
        return { cube, solvers, ssolver };
      }
    }
    console.log(
      `failed to generate random state after ${this.levelMaxAttempt} tries`
    );
    return { ...this.getRandomAnyLevel(), failed: true };
  }

  constructor(state: AppState) {
    super(state);
    // Enable below only when we decide to support evaluator selection
    //let evalName = this.state.config.evaluator.getActiveName()
    //this.evaluator = getEvaluator(evalName)
    this.evaluator = new SeqEvaluator();
  }
  _solve_with_solvers(cube: CubieCube, solverNames: string[]): CaseDesc[] {
    const state = this.state;
    const totalSolutionCap =
      0 |
      (+(state.config.solutionNumSelector.getActiveName() || 5) *
        this.expansionFactor);
    const selectedSolutionCap = +(
      state.config.solutionNumSelector.getActiveName() || 5
    );
    let getDesc = (solverName: string) => {
      const solver = CachedSolver.get(solverName);
      const premoves = this.premoves || [""];
      let solutions = premoves
        .map((pm) =>
          solver
            .solve(cube.apply(pm), 0, this.solverR, totalSolutionCap)
            .map((sol) => ({
              pre: pm,
              sol: sol,
              score: this.evaluator.evaluate(sol),
            }))
        )
        .flat();
      solutions.sort((a, b) => a.score - b.score);
      const toString = (sol: any) =>
        (sol.pre === "" ? "" : "(" + sol.pre + ") ") +
        sol.sol.toString(this.algDescWithMoveCount); // + sol.score.toFixed(2);
      const algs = solutions.slice(0, selectedSolutionCap).map(toString);
      let algdesc: CaseDesc = {
        id: `${solverName}`,
        algs,
        kind: `${solverName}`,
      };
      return algdesc;
    };
    return solverNames.map(getDesc);
  }

  _solve(
    cube: CubieCube,
    solverNames: string[],
    options?: {
      updateSolutionOnly?: boolean;
      scrambleSolver?: string;
      scramble?: string;
    }
  ) {
    const state = this.state;
    options = options || {};
    let algDescs = this._solve_with_solvers(cube, solverNames);
    let setup: string;
    if (options.scramble) {
      setup = options.scramble;
    } else if (options.updateSolutionOnly) {
      setup = this.state.case.desc[0]!.setup!;
    } else {
      const scramble =
        options.scrambleSolver === "min2phase"
          ? CachedSolver.get("min2phase").solve(cube, 0, 0, 0)[0].inv()
          : (() => {
              const solutionLength = new MoveSeq(
                algDescs[0].algs[0]
              ).remove_setup().moves.length;
              //console.log(options)
              //console.log("SOLVING CUBE ", cube)
              let result = rand_choice(
                CachedSolver.get(
                  options.scrambleSolver || solverNames[0]
                ).solve(
                  cube,
                  Math.min(
                    this.solverR,
                    Math.max(this.solverL, solutionLength + this.scrambleMargin)
                  ),
                  this.solverR,
                  this.scrambleCount || 1
                )
              )?.inv();
              //if (result === undefined) {
              //    result = rand_choice(CachedSolver.get(options.scrambleSolver || solverNames[0])
              //    .solve(cube, 0, this.solverR, this.scrambleCount || 1)).inv()
              //}
              return result;
            })();
      setup = scramble.toString();
    }
    if (algDescs.length === 0) {
      algDescs = [
        {
          id: `min2phase`,
          algs: [],
          setup,
          kind: `min2phase`,
        },
      ];
    } else {
      // populate setup into setup
      algDescs.forEach((algDesc) => (algDesc.setup = setup));
    }

    const ori = options.updateSolutionOnly
      ? this.state.cube.ori
      : alg_generator_from_group(state.config.orientationSelector)().id;
    // console.log("algdesc", algdesc)
    return {
      ...state,
      cube: {
        ...state.cube,
        state: cube,
        ori,
      },
      case: {
        state: new CubieCube().apply(setup),
        desc: algDescs,
      },
    };
  }
  _updateCase(): AppState {
    let {
      cube,
      solvers: solverNames,
      ssolver: scrambleSolver,
      failed,
    } = this.getRandom();
    let inputScramble: string | undefined = undefined;
    if (this.state.scrambleInput.length > 0) {
      inputScramble = this.state.scrambleInput[0];
      cube = new CubieCube().apply(inputScramble);
    }
    let state = this._solve(cube, solverNames, {
      updateSolutionOnly: false,
      scrambleSolver,
      scramble: inputScramble,
    });
    if (inputScramble) {
      state = { ...state, scrambleInput: state.scrambleInput.slice(1) };
    }
    state = { ...state, cube: { ...state.cube, levelSuccess: !failed, history: [], prevState: null}  };
    if (state.name !== StateT.revealed) state.name = StateT.revealed;

    return state;
  }
  _updateCap(): AppState {
    const state = this.state;
    if (state.case.desc.length === 0) {
      return state;
    }
    const [cube, solverNames] = [
      state.cube.state,
      state.case.desc!.map((x) => x.kind),
    ];
    return this._solve(cube, solverNames, {
      updateSolutionOnly: true,
    });
  }

  _addAttempt() {
    let state = this.state;
    let solution = state.cube.history;

    let desc: CaseDescMini[] = state.case.desc.map((d) => {
      let { algs, ...desc } = d;
      return desc;
    });

    let minMove = state.case.desc
      .map((d) =>
        d.algs.map((a) => new MoveSeq(a).remove_setup().moves.length)
      )
      .flat()
      .reduce((a, b) => Math.min(a, b), 100);

    const attemptData: AttemptData = {
      solution,
      totalResultMs: solution.length,
      unixDate: Date.now(),
      scramble: desc,
      theoretical: minMove,
    };

    state.result.goal.addNewAttempt(attemptData);
  }

  onReplay(case_: FavCase): AppState {
    const cube = new CubieCube().apply(case_.setup);
    const state1 = this._solve(cube, case_.solver, { scramble: case_.setup });
    return {
      ...state1,
      mode: case_.mode,
    };
  }
  onControl(s: string): AppState {
    let state = this.state;
    if (s === "#space") {
      let prevState;
      let cubeState;

      if (state.cube.prevState) {
        prevState = null;
        cubeState = state.cube.prevState;
      } else {
        prevState = state.cube.state;
        cubeState = state.case.state;
      }

      return {
        ...state,
        cube: {
          ...state.cube,
          state: cubeState,
          prevState,
        },
      };
    } else if (s === "#enter") {
      this._addAttempt();
      return this._updateCase();
    } else if (s === "#escape" && state.name !== StateT.revealed) {
      return { ...state, name: StateT.revealed };
    }

    return state;
  }

  onMove(movestr: string): AppState {
    let state = this.state;
    let moves = new MoveSeq(movestr).moves;
    if (moves.length > 0) {
      let prevState = state.cube.prevState;
      let move = moves[0];
      let cube = state.cube.state.apply(move);

      let is_solved = this.isSolved(cube);
      if (is_solved) {
        return this._updateCase();
      }

      state = {
        ...state,
        cube: {
          ...state.cube,
          state: state.cube.state.apply(move),
          history: [...state.cube.history, movestr],
          prevState: prevState ? null : prevState,
        },
      };

      if (
        state.name === StateT.solving ||
        (state.name === StateT.inspection && allPremoves.includes(movestr))
      ) {
        return state;
      } else if (
        state.name === StateT.revealed &&
        allPremoves.includes(movestr)
      ) {
        state.name = StateT.inspection;
      } else {
        state.name = StateT.solving;
      }

      return state;
    } else {
      // Nothing to apply
      return state;
    }
  }
  onConfig(conf: Config): AppState {
    // see if solution cap changed
    let changed = !arrayEqual(
      this.state.config.solutionNumSelector.flags,
      conf.solutionNumSelector.flags
    );
    if (changed) {
      return (
        StateFactory.create({
          ...this.state,
          config: conf,
        }) as BuildStateM
      )._updateCap();
    } else {
      return this.state;
    }
  }

  onInitial() {
    this.state = this._updateCase();
    return this.state;
  }
}
