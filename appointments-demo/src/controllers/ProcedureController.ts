import * as Alexa from "alexa-sdk";
import {
    ProcedureService
} from "../services";
import { IntentController } from "./base/IntentController";

export class ProcedureController extends IntentController {

    procedureService: ProcedureService;

    constructor(handler: Alexa.Handler<Alexa.Request>) {
        super(handler);
        this.procedureService = new ProcedureService(handler);
    }

    async procedureListingIntent(): Promise<void> {
        await this.procedureService.procedureListing();
    }
}