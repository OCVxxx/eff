export type Moves = number;

export class Stats {
  private static compareNumbers(a: Moves, b: Moves) {
    return a - b;
  }

  static lastN(
    l: Moves[],
    N: number,
    options?: { allowPartial: boolean }
  ): Moves[] | null {
    if (l.length < N) {
      return options?.allowPartial ? l : null;
    }
    return l.slice(0, N);
  }

  static harmonicMean(l: Moves[] | null, n: number): Moves | null {
    if (l == null) {
      return null;
    }

    let total = 0;
    for (let i = 0; i < l.length - 0; i++) {
      total += 1 / l[i];
    }
    return n / total;
  }

  static mean(l: Moves[] | null): Moves | null {
    if (l == null) {
      return null;
    }

    let total = 0;
    for (let i = 0; i < l.length - 0; i++) {
      total += l[i];
    }
    return total / l.length;
  }

  /*
   * @param {Array<!TimerApp.Timer.Milliseconds>|null} l
   * @returns {Number}
   */
  static trimmedAverage(l: Moves[] | null): Moves | null {
    if (l == null || l.length < 3) {
      return null;
    }

    const sorted = l.sort(this.compareNumbers);
    const len = sorted.length;
    const trimFromEachEnd = Math.ceil(len / 20);

    let total = 0;
    for (let i = trimFromEachEnd; i < len - trimFromEachEnd; i++) {
      total += sorted[i];
    }
    return total / (len - 2 * trimFromEachEnd);
  }

  static best(l: Moves[] | null): Moves | null {
    if (l == null || l.length === 0) {
      return null;
    }
    return Math.min.apply(this, l);
  }

  static worst(l: Moves[] | null): Moves | null {
    if (l == null || l.length === 0) {
      return null;
    }
    return Math.max.apply(this, l);
  }

  static formatPerformance(
    estimate: Moves | null,
    options?: { partial: boolean }
  ): string {
    if (estimate === null) {
      return "—";
    }

    let result = estimate.toFixed(2);
    if (options?.partial) {
      result = `(${result})`;
    }
    return result;
  }

  static performanceToAverage(performance: number[], N: number): string {
    return Stats.formatPerformance(
      Stats.trimmedAverage(Stats.lastN(performance, N))
    );
  }
}
