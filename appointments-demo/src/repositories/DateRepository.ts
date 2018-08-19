import { sequelizeInstance } from "../database/database.provider";

export class DateRepository {

    private readonly sequelizeInstance;

    constructor() {
        this.sequelizeInstance = sequelizeInstance();

    }

    public async findRandom(): Promise<String> {
        return "19/11/2018";
    }
}

