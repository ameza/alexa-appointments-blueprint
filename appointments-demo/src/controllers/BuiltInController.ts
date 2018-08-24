import * as Alexa from "alexa-sdk";
import { IntentController } from "./base/IntentController";

export class BuiltInController extends IntentController {

    constructor(handler: Alexa.Handler<Alexa.Request>) {
        super(handler);
    }

    helpIntent(): void {
        const speech = "Dental Office allows you to bookIntent appointments in our dental offices, start by saying bookIntent an appointment, if you are not sure about your available options just wait or check your alexa app";
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
        const speech = "Dental Office allows you to bookIntent appointments in our dental offices, start by saying bookIntent an appointment, if you are not sure about your available options just wait or check your alexa app";
        this.handler.emit(":ask", speech, speech);
    }

    launchIntent(): void {
        const speech = "Welcome to Dental Office, this skill allows you to book appointments in our dental offices, start by saying book an appointment";
        this.handler.emit(":ask", speech, speech);
    }

    notdefinedIntent(): void {
        const speech = "bad request";
        this.handler.emit(":ask", speech, speech);
    }
}

export default BuiltInController;