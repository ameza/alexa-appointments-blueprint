import { sequelizeInstance } from "../database/database.provider";
import { Branch } from "../models/";

export class BranchRepository {

    private readonly sequelizeInstance;

    constructor() {
        this.sequelizeInstance = sequelizeInstance();

    }

    public async findAll(): Promise<Array<Branch>> {
        return await Branch.findAll<Branch>({where: { enabled : true }, raw: false});
    }

    public async findRandom(): Promise<Branch> {
        const all = await this.findAll();

        return all[Math.floor(Math.random() * all.length)];

    }
}

