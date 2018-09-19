import * as Alexa from "alexa-sdk";
import { AlexaResponse, Configuration} from "../models";
import {
    AssessorService, ConfigurationService
} from "../services";
import { IntentController } from "./base/IntentController";

export class AssessorController extends IntentController {

    assessorService: AssessorService;
    configurationService: ConfigurationService;

    constructor(handler: Alexa.Handler<Alexa.Request>) {
        super(handler);
        this.assessorService = new AssessorService(handler);
        this.configurationService = new ConfigurationService();
    }

    // retrieves the model config from the db
    async getModelConfiguration(): Promise<Configuration> {
        return await this.configurationService.getModelConfiguration();
    }

    async assessorListingIntent(): Promise<void> {

        const config = await this.getModelConfiguration();
            switch (config.assessorConfig) {
                case "N":

                    const alexaResponse: AlexaResponse = <AlexaResponse>{
                        repromptSpeech: "Please say continue to resume your booking",
                        speechOutput: "Assessors are not required for this appointment, please say continue to resume your booking",
                        cardContent: `Say continue to resume your booking`,
                        cardTitle: "Please continue",
                    };
                    this.handler.emit(":askWithCard",  alexaResponse.speechOutput, alexaResponse.repromptSpeech, alexaResponse.cardTitle, alexaResponse.cardContent,  alexaResponse.imageObj);

                    break;
                default:
                    await this.assessorService.assessorListing();
                    break;
        }


    }
}