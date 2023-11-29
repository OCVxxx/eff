import React from "react";
import AppView from "./components/TrainerView";
import { getInitialState } from "./reducers/InitialState";
import { resetConfig } from "./reducers/LocalStorage";
import { reducer } from "./reducers/Reducer";

window.addEventListener("keypress", function (e) {
  if (e.keyCode === 32 && e.target === document.body) {
    e.preventDefault();
  }
  if (e.altKey && e.ctrlKey && e.key === "r") {
    resetConfig();
    console.log("config reset");
  }
});

const initialState = getInitialState();

function App(props: {}) {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  return <AppView state={state} dispatch={dispatch} />;
}
export default App;