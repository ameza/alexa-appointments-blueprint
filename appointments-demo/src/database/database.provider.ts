"use strict";

import { Sequelize } from "sequelize-typescript";

import { Appointment, Assessor, Branch, Configuration, Service } from "../models/";
import { DbConfigHelper } from "./helpers/dbConfig.helper";

export const sequelizeInstance = (): Sequelize => {

        const config = DbConfigHelper.getDbConfig();
        const sequelize = new Sequelize(config);
        sequelize.addModels([Assessor, Appointment, Service, Branch, Configuration ]);
        /* await sequelize.sync(); add this if you want to sync model and DB.*/
        return sequelize;
};
