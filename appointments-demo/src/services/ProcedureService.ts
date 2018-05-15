import { sequelizeInstance } from "../database/database.provider";
import { Service } from "../models/";

export class ProcedureService {

    private readonly sequelizeInstance;

    constructor() {
        this.sequelizeInstance = sequelizeInstance();

    }

    public async findAll(): Promise<Array<Service>> {
        return await Service.findAll<Service>({raw: false});
    }
}

