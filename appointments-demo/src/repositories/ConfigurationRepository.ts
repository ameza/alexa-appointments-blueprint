import { sequelizeInstance } from "../database/database.provider";
import { Configuration } from "../models/";

export class ConfigurationRepository {

    private readonly sequelizeInstance;

    constructor() {
        this.sequelizeInstance = sequelizeInstance();

    }

    public async findOne(): Promise<Configuration> {
        return await Configuration.findOne<Configuration>({raw: false});
    }
}

