import React from "react";
import { AppState } from "../../Types";
import { CaseDesc } from "../../lib/Algs";
import { Heading } from "../heading/Heading";

function get_algs(d: CaseDesc) {
  return d.algs;
}

function describe_reveal(algs: CaseDesc[]) {
  if (algs.length === 1) {
    return get_algs(algs[0]).map((alg) => <li>{alg}</li>);
  } else {
    return algs.map((alg) => <li>get_algs(alg)</li>);
  }
}

export function Solutions({ state }: { state: AppState }) {
  let prevSol: CaseDesc[] = state.case.desc;

  if (prevSol.length <= 0) return null;

  return (
    <>
      <div className="solutions-wrapper">
        {/* <div className="first-sol-width">{get_algs(prevSol[0])[0]}</div> */}
        <Heading
          headings={[
            {
              content: "SOLUTIONS",
              className: "heading-right heading-solutions",
            },
          ]}
          gridClass="grid-solutions"
        />
      </div>
      <ul className="solutions-text">{describe_reveal(prevSol)}</ul>
    </>
  );
}
