import "isomorphic-fetch";
import  { sequelizeInstance } from "../database/database.provider";
import  { Appointment } from "../models";
import {
    AppointmentRequest, AppointmentResponse,
} from "../models/dto";

export class AppointmentRepository {

    private readonly sequelizeInstance;

    constructor() {
        this.sequelizeInstance = sequelizeInstance();

    }



    public async create(appointmentRequest: AppointmentRequest): Promise<Appointment> {
        return await this.sequelizeInstance.transaction(async transaction => {
            return await Appointment.create<Appointment>({
                assessor: appointmentRequest.selAssessor,
                branch: appointmentRequest.selBranch,
                date: appointmentRequest.selDate,
                email: "",
                endTime: appointmentRequest.selTime,
                starTime: appointmentRequest.selTime,
                service: appointmentRequest.selService,
            }, {
                returning: true,
                transaction,
            });
        });
    }
}
