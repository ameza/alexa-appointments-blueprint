
export interface Config {
    isProduction: boolean;
    databaseConfig: {
        development: IDatabaseConfigAttributes;
        production: IDatabaseConfigAttributes;
        test: IDatabaseConfigAttributes;
    };
}

export interface IDatabaseConfigAttributes {
    username: string;
    password: string;
    database: string;
    host: string;
    port: number;
    dialect: string;
    logging: boolean | Function;
    force: boolean;
    timezone: string;
    tablePrefix: string;
}


export const configInstance: Config = {
    isProduction : process.env.NODE_ENV === "production",
    databaseConfig: {
        development: {
            username: process.env.DB_USER || "lambdaucr",
            password: process.env.DB_PASSWORD || "N8sV4CzaRM29x8",
            database: process.env.DB_NAME || "appointments",
            host: process.env.DB_HOST || "54.165.28.105",
            port: Number(process.env.DB_PORT) || 3306,
            dialect: "mysql",
            logging: false,
            force: true,
            timezone: "-06:00",
            tablePrefix: "",
        },
        production: {
            username: process.env.DB_USER || "lambdaucr",
            password: process.env.DB_PASSWORD || "N8sV4CzaRM29x8",
            database: process.env.DB_NAME || "appointments",
            host: process.env.DB_HOST || "54.165.28.105",
            port: Number(process.env.DB_PORT) || 3306,
            dialect: "mysql",
            logging: false,
            force: true,
            timezone: "-06:00",
            tablePrefix: "",
        },
        test: {
            username: process.env.DB_USER || "lambdaucr",
            password: process.env.DB_PASSWORD || "N8sV4CzaRM29x8",
            database: process.env.DB_NAME || "appointments",
            host: process.env.DB_HOST || "54.165.28.105",
            port: Number(process.env.DB_PORT) || 3306,
            dialect: "mysql",
            logging: false,
            force: true,
            timezone: "-06:00",
            tablePrefix: "",
        },
    }
};