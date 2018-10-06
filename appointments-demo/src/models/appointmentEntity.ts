"use strict";

import {
    Column,
    DataType,
    Model,
    Table, UpdatedAt,
} from "sequelize-typescript";

import { IDefineOptions } from "sequelize-typescript/lib/interfaces/IDefineOptions";


import { DbNamingHelper } from "../database/helpers";



const tableOptions: IDefineOptions = { timestamp: true, tableName:  DbNamingHelper.getTablePrefix("appointments") } as IDefineOptions;

@Table(tableOptions)
export class Appointment extends Model<Appointment> {
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
        field: "email",
    })
    public email: string;

    @Column({
        type: DataType.CHAR(50),
        allowNull: false,
        field: "branch",
    })
    public branch: string;

    @Column({
        type: DataType.CHAR(50),
        allowNull: false,
        field: "service",
    })
    public service: string;

    @Column({
        type: DataType.CHAR(50),
        allowNull: false,
        field: "assessor",
    })
    public assessor: string;

    @Column({
        type: DataType.CHAR(50),
        allowNull: false,
        field: "startTime",
    })
    public startTime: string;

    @Column({
        type: DataType.CHAR(50),
        allowNull: false,
        field: "endTime",
    })
    public endTime: string;


    @Column({
        type: DataType.CHAR(50),
        allowNull: false,
        field: "date",
    })
    public date: string;

   /*
    @BeforeValidate
    public static validateData(account: Account, options: any) {
        if (!options.transaction) throw new Error("Missing transaction.");
        if (!account.firstName) throw new MessageCodeError("account:create:missingFirstName");
        if (!account.lastName) throw new MessageCodeError("account:create:missingLastName");
        if (!account.email) throw new MessageCodeError("account:create:missingEmail");
        if (!account.password) throw new MessageCodeError("account:create:missingPassword");
        if (!account.approvalStatus) throw new MessageCodeError("account:create:missingApprovalStatus");
        if (!account.accountStatus) throw new MessageCodeError("account:create:missingAccountStatus");
        if (!account.role) throw new MessageCodeError("account:create:missingRole");
    }*/
}
