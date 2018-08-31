import * as Alexa from "alexa-sdk";
import {AppointmentRequest, AppointmentResponse} from "../models/dto";
import { AppointmentRepository } from "../repositories";

export class AppointmentService {

    appointmentRepository: AppointmentRepository;
    handler: Alexa.Handler<Alexa.Request>;

    constructor(handler: Alexa.Handler<Alexa.Request>) {
        this.handler = handler;
        this.appointmentRepository = new AppointmentRepository();
    }
    public async book(request: AppointmentRequest): Promise<AppointmentResponse> {

        let message = "";
        try {
            const appointment = await this.appointmentRepository.create(request);
            console.info(appointment);
            if (appointment.dataValues.id) {


                const assessorText = (request.selAssessor === "N/A") ? "" : `with ${request.selAssessor}`;
                const dateText = (request.selDate === "N/A") ? "" : `for ${request.selDate}`;
                const timeText = (request.selTime === "N/A") ? "" : `at ${request.selTime}`;

                const message = `I just booked a ${request.selService} appointment ${assessorText} ${dateText} ${timeText} on the ${request.selBranch} office. A confirmation notification has been sent to your email. Thank you for using dental office`;

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
}