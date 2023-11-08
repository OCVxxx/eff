import { Dispatch, SetStateAction } from "react";
import { AttemptDataWithIDAndRev } from "./AttemptData";
import { Goal } from "./Goal";
import { RawData } from "./RawData";

const LATEST_AMOUNT = 100;

export class ResultsApp {
  public goal = new Goal();

  private async latest(): Promise<AttemptDataWithIDAndRev[]> {
    return (await this.goal.mostRecentAttemptsForEvent(LATEST_AMOUNT)).docs;
  }

  async getRawData() {
    const attempts = await this.latest();
    const performances = attempts.map(
      (attempt) => (100 * attempt.theoretical / attempt.totalResultMs)
    );
    const numAttempts = (await this.goal.db.info()).doc_count - 1;

    return { performances, numAttempts };
  }

  watchData(setData: Dispatch<SetStateAction<RawData>>) {
    this.goal.db
      .changes({
        since: "now",
        live: true,
      })
      .on("change", async () => {
        let attempts = await this.latest()
        const performances = attempts.map(
          (attempt) => (100 * attempt.theoretical / attempt.totalResultMs)
        );
        setData({
          performances,
          numAttempts: (await this.goal.db.info()).doc_count - 1,
        });
      });
  }
}
