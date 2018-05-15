import { sequelizeInstance } from "../database/database.provider";
import { Branch } from "../models/";

export class BranchService {

    private readonly sequelizeInstance;

    constructor() {
        this.sequelizeInstance = sequelizeInstance();

    }

    public async findAll(): Promise<Array<Branch>> {
        return await Branch.findAll<Branch>({where: { enabled : true }, raw: false});
    }
}

