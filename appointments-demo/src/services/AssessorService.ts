import { sequelizeInstance } from "../database/database.provider";
import {Configuration} from "../models";
import { Assessor } from "../models/";

export class AssessorService {

    private readonly sequelizeInstance;

    constructor() {
        this.sequelizeInstance = sequelizeInstance();

    }

    public async findAll(): Promise<Array<Assessor>> {
        return await Assessor.findAll<Assessor>({where: { enabled : true }, raw: false});
    }

    public async findRandom(): Promise<Assessor> {
       const all = await this.findAll();

       return all[Math.floor(Math.random() * all.length)];

    }
}

