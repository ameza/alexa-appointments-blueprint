import * as Alexa from "alexa-sdk";
import {
    AssessorService
} from "../services";
import { IntentController } from "./base/IntentController";

export class AssessorController extends IntentController {

    assessorService: AssessorService;

    constructor(handler: Alexa.Handler<Alexa.Request>) {
        super(handler);
        this.assessorService = new AssessorService(handler);
    }

    async assessorListingIntent(): Promise<void> {
        await this.assessorService.assessorListing();
    }
}