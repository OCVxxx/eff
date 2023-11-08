export type formattedData = {
  mean3: string;
  avg5: string;
  avg12: string;
  avg100: string;
  rate3: string; // TODO: avoid duplicate work
  // { partial: numAttempts < 3 },
  rate5: string; // TODO: avoid duplicate work
  // { partial: numAttempts < 5 },
  rate12: string; // TODO: avoid duplicate work
  // { partial: numAttempts < 12 },
  rate100: string; // TODO: avoid duplicate work
  // { partial: numAttempts < 100 },
  best: string;
  worst: string;
  numAttempts: number; // TODO: exact number
};
