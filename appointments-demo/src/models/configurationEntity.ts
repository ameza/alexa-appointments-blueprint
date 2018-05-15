"use strict";

import {
    Column,
    DataType,
    Model,
    Table, UpdatedAt,
} from "sequelize-typescript";

import { IDefineOptions } from "sequelize-typescript/lib/interfaces/IDefineOptions";


import { DbNamingHelper } from "../database/helpers";



const tableOptions: IDefineOptions = { timestamp: true, tableName:  DbNamingHelper.getTablePrefix("configurations") } as IDefineOptions;

@Table(tableOptions)
export class Configuration extends Model<Configuration> {
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
        type: DataType.CHAR(1),
        allowNull: false,
        field: "date",
    })
    public dateConfig: string;

    @Column({
        type: DataType.CHAR(1),
        allowNull: false,
        field: "time",
    })
    public timeConfig: string;

    @Column({
        type: DataType.CHAR(1),
        allowNull: false,
        field: "assessor",
    })
    public assessorConfig: string;

    @Column({
        type: DataType.NUMERIC,
        allowNull: false,
        field: "slotSizeMinutes",
    })
    public slotSizeMinutes: number;

}
