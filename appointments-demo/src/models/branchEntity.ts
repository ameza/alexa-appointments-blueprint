"use strict";

import {
    Column,
    DataType,
    Model,
    Table, UpdatedAt,
} from "sequelize-typescript";

import { IDefineOptions } from "sequelize-typescript/lib/interfaces/IDefineOptions";


import { DbNamingHelper } from "../database/helpers";



const tableOptions: IDefineOptions = { timestamp: true, tableName:  DbNamingHelper.getTablePrefix("branches") } as IDefineOptions;

@Table(tableOptions)
export class Branch extends Model<Branch> {
    @Column({
        type: DataType.NUMERIC,
        allowNull: false,
        autoIncrement: true,
        unique: true,
        primaryKey: true,
        field: "id",
    })
    public id: number;

    @Column({
        type: DataType.CHAR(50),
        allowNull: false,
        field: "value",
    })
    public value: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        field: "enabled",
    })
    public enabled: boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        field: "popular",
    })
    public popular: boolean;

}
