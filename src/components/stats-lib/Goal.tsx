import { AttemptData, AttemptDataWithID } from "./AttemptData";
import { newDateUUID } from "./uuid";
import PouchDB from "pouchdb";
import PouchDBFind from "pouchdb-find";

PouchDB.plugin(PouchDBFind);

export class Goal {
    public db: PouchDB.Database<AttemptData>;
    // public remoteDB: PouchDB.Database<AttemptData>;
    
    constructor(name: string = "goal") {
        this.db = new PouchDB(`goal_${name}`);
        this.db.createIndex({
          index: { fields: ["totalResultMs"] },
        });
      }

      async addNewAttempt(data: AttemptData): Promise<PouchDB.Core.Response> {
        const dataWithId = data as AttemptDataWithID;
        dataWithId._id = newDateUUID(data.unixDate);
        // console.log(dataWithId);
        let b = await this.db.put(dataWithId);
        return b;
      }

      async mostRecentAttemptsForEvent(limit: number) {
        let j = await this.db.find({
          selector: {
            totalResultMs: { $gt: null },
          },
          sort: [{ _id: "desc" }],
          limit: limit,
        });

        return j;
      }
      
}