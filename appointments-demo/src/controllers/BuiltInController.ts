import * as Alexa from "alexa-sdk";
import { IntentController } from "./IntentController";

class BuiltInController extends IntentController {

    constructor(handler: Alexa.Handler<Alexa.Request>) {
        super(handler);
    }

    help(): void {
        const speech = "Dental Office allows you to book appointments in our dental offices, start by saying book an appointment, if you are not sure about your available options just wait or check your alexa app";
        this.handler.emit(":ask", speech, speech);
    }

    stop(): void {

        const speech = "Thank you for using Dental Office";

        this.handler.emit(":tell", speech, speech);
    }

    cancel(): void {
        const speech = "Thank you for using Dental Office";

        this.handler.emit(":tell", speech, speech);
    }

    fallBack(): void {
        const speech = "Dental Office allows you to book appointments in our dental offices, start by saying book an appointment, if you are not sure about your available options just wait or check your alexa app";
        this.handler.emit(":ask", speech, speech);
    }
}

export default BuiltInController;