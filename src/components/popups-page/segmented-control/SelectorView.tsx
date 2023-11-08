import React from "react";
import { Action, AppState, SliderOpt } from "../../../Types";
import { SegmentedButton } from "./SegmentedButton";
import Selector from "./Selector";
import "./segmented-control.css";

function SliderView(props: {
  slider: SliderOpt;
  onChange: (n: number) => void;
  activeIndex: number;
}) {
  let { slider } = props;

  let marks = React.useMemo(() => {
    const handleChange = (newValue: number | number[]) => {
      let v = Array.isArray(newValue) ? newValue[0] : newValue;
      if (slider.l - 1 <= v && v <= slider.r) props.onChange(v);
    };

    let anyValue = slider.l - 1;

    let controlLength = slider.r - slider.l + 2;
    let obj = [
      <SegmentedButton
        onClick={() => handleChange(anyValue)}
        isActive={anyValue === props.activeIndex}
        key={anyValue}
        isSmall={controlLength >= 3 ? true : false}
      >
        Any
      </SegmentedButton>,
    ];
    for (let i = slider.l; i <= slider.r; i++) {
      let suffix = "";
      if (i === slider.l && slider.extend_l) suffix = "-";
      if (i === slider.r && slider.extend_r) suffix = "+";
      obj.push(
        <SegmentedButton
          onClick={() => handleChange(i)}
          isActive={i === props.activeIndex}
          key={i}
          isSmall={controlLength >= 3 ? true : false}
        >
          {i.toString() + suffix}
        </SegmentedButton>
      );
    }
    return obj;
  }, [slider.l, slider.r, slider.extend_l, slider.extend_r, props]);

  return <>{marks}</>;
}

function SliderSelect(props: {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  select: string;
}) {
  let sliderName = props.select;
  let sliderOpt = (props.state.config as any)[sliderName] as SliderOpt;
  let activeIndex = props.state.config.fbLevelSelector.value;

  return (
    <SliderView
      slider={(props.state.config as any)[sliderName] as SliderOpt}
      onChange={(n: number) => {
        props.dispatch({
          type: "config",
          content: { [sliderName]: { ...sliderOpt, value: n } },
        });
        props.dispatch({ type: "key", content: "#enter" });
      }}
      activeIndex={activeIndex}
    />
  );
}

function SingleSelect(props: {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  select: string;
  label?: string;
}) {
  let { state, dispatch, select } = props;
  let { config } = state;
  let sel = (config as any)[select] as Selector;

  const handleChange = (toSelect: number) => {
    let { names } = sel;
    let n = names.length;
    let new_flags = Array(n).fill(0);

    for (let i = 0; i < names.length; i++) {
      if (names[i] === names[toSelect]) {
        new_flags[i] = 1;
      }
    }
    dispatch({
      type: "config",
      content: { [select]: sel.setFlags(new_flags) },
    });
  };

  return (
    // {sel.names.map((name) => (
    //   <FormControlLabel
    //     key={name}
    //     value={name}
    //     control={<Radio color="primary" />}
    //     label={name}
    //     labelPlacement="end"
    //   />
    // ))}
    <>
      {sel.names.map((name, i) => (
        <SegmentedButton
          onClick={() => handleChange(i)}
          isActive={sel.flags[i] === 1}
          unique={name}
          key={name}
          isSmall={sel.names.length >= 3 ? true : false}
        >
          {name}
        </SegmentedButton>
      ))}
    </>
  );
}

export { SingleSelect, SliderSelect };
