"use strict";

import { configInstance } from "../../config";

export class DbConfigHelper {

    public static getDbConfig() {

        let config;
        switch (process.env.NODE_ENV) {
            case "prod":
            case "production":
                config = configInstance.databaseConfig.production;
            case "dev":
            case "development":
                config = configInstance.databaseConfig.development;
            default:
                config = configInstance.databaseConfig.development;
        }
        return config;
    }
}