import * as Alexa from "alexa-sdk";
import { IntentController } from "./base/IntentController";
import {AppointmentService} from "../services";
import {attachedPoliciesListType} from "aws-sdk/clients/iam";
import {AvailabilityResponse} from "../models/dto";

export class BuiltInController extends IntentController {

    constructor(handler: Alexa.Handler<Alexa.Request>) {
        super(handler);
    }

    helpIntent(): void {
        const speech = "Dental Office allows you to bookIntent appointments in our dental offices, start by saying bookIntent an appointment";
        this.handler.emit(":ask", speech, speech);
    }

    stopIntent(): void {

        const speech = "Thank you for using Dental Office";

        this.handler.emit(":tell", speech, speech);
    }

    cancelIntent(): void {
        const speech = "Thank you for using Dental Office";

        this.handler.emit(":tell", speech, speech);
    }

    fallBackIntent(): void {
        const speech = "I couldn't match that with any valid input, start by saying book an appointment";
        this.handler.emit(":ask", speech, speech);
    }

    launchIntent(): void {

        const speech = "Welcome to Dental Office, this skill allows you to book appointments in our dental offices, start by saying book an appointment";
        this.handler.emit(":ask", speech, speech);
    }

    notdefinedIntent(): void {
        const speech = "I'm sorry I couldn't identify the provided input, start by saying book an appointment";
        this.handler.emit(":ask", speech, speech);
    }
}

export default BuiltInController;