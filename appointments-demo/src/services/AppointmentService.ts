import "isomorphic-fetch";
import  { sequelizeInstance } from "../database/database.provider";
import  { Appointment } from "../models";
import {
    AppointmentRequest, AppointmentResponse,
} from "../models/dto";

export class AppointmentService {

    private readonly sequelizeInstance;

    constructor() {
        this.sequelizeInstance = sequelizeInstance();

    }

    public async book(request: AppointmentRequest): Promise<AppointmentResponse> {

            let message = "";
            try {
                const appointment = await this.create(request);
                console.info(appointment);
                if (appointment.dataValues.id) {


                    const assessorText = (request.selAssessor === "N/A") ? "" : `with ${request.selAssessor}`;
                    const dateText = (request.selDate === "N/A") ? "" : `for ${request.selDate}`;
                    const timeText = (request.selTime === "N/A") ? "" : `at ${request.selTime}`;

                    const message = `I just booked a ${request.selService} appointment ${assessorText} ${dateText} ${timeText} on the ${request.selBranch} office. A confirmation notification has been sent to your email. Thanks`;

                    return <AppointmentResponse>{
                        text: `${message}`,
                        ssml: `<speak>${message}</speak>`
                    };
                }
                else {
                    message = "I'm sorry, but I couldn't book your appointment, there was an internal error";
                    return <AppointmentResponse>{
                        text: `${message}`,
                        ssml: `<speak>${message}</speak>`
                    };
                }
            }
            catch (ex) {
                message = "I'm sorry, but I couldn't book your appointment, there was an internal error";
                console.error(ex);
                return <AppointmentResponse>{
                    text: `${message}`,
                    ssml: `<speak>${message}</speak>`
                };
            }
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

