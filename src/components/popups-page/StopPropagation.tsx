import { MouseEventHandler } from "react";

export const handleDialog = (e: React.KeyboardEvent<HTMLDivElement>) => {
  e.stopPropagation();
  e.nativeEvent.stopImmediatePropagation();

//   e.stopImmediatePropagation();
};
