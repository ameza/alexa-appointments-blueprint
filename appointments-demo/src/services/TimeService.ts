import { sequelizeInstance } from "../database/database.provider";


export class TimeService {

    private readonly sequelizeInstance;

    constructor() {
        this.sequelizeInstance = sequelizeInstance();

    }

    public async findRandom(): Promise<String> {
        return "14:00";
    }
}

