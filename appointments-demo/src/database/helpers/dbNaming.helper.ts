"use strict";

import { DbConfigHelper } from "./dbConfig.helper";

export class DbNamingHelper {

    public static getTablePrefix(tableName: string): string {

        const config = DbConfigHelper.getDbConfig();

        return config.tablePrefix + tableName;
    }
}