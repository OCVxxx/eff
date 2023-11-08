import { UUID } from "./uuid";

export type CaseDescMini = {
    id: string,
    setup?: string,
    kind: string
}

export interface AttemptData {
  // Total result *including* penalties, rounded to the nearest millisecond.
  // TODO: FMC, multi blind, BLD memo info
  
  scramble: CaseDescMini[];
  solution: string[];
  
  totalResultMs: number
  theoretical: number

  // Unix date of the solve, in milliseconds.
  // Ideally, this date represents the end of the solve (the moment when the timer stopped).
  // TODO: Add a revision date?
  unixDate: number;

  // Arbitrary user-provided comment.
  comment?: string;
}

type AttemptUUID = UUID;

export interface AttemptDataWithID extends AttemptData {
  // Globally unique, unpredictable identifier.
  // Must be unique across all attempts everywhere, ever.
  _id: AttemptUUID;
}

export interface AttemptDataWithIDAndRev extends AttemptDataWithID {
  _rev: string;
}