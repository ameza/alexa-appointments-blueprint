import * as Alexa from "alexa-sdk";
import { Elicit, Service } from "../models";
import { ProcedureRepository } from "../repositories";

// Procedure a.k.a Service
export class ProcedureService {

    procedureRepository: ProcedureRepository;
    handler: Alexa.Handler<Alexa.Request>;

    constructor(handler: Alexa.Handler<Alexa.Request>) {
        this.handler = handler;
        this.procedureRepository = new ProcedureRepository();
    }

    getRecommendedProcedures(services: Array<Service>): string {
        const recommended = services.filter((x) => x.enabled && x.popular === true);
        if (recommended.length === 1) {
            return recommended.pop().value;
        }
        else {
            const last = recommended.pop();
            return `${recommended.map(x => {  return x.value; }).join(", ")} and ${last.value}`;
        }
    }

    getFullProcedures(services: Array<Service>): string {
        const all = services.filter((x) => x.enabled);
        return ` ${all.map( x => { return x.value; }).join("\r\n")}`;
    }

    handleProcedureSlotConfirmation(intentObj: Alexa.Intent): void {
        if (intentObj.slots.SEL_SERVICE.confirmationStatus === "DENIED") {
            this.procedureElicit(intentObj, true, false);
        } else {
            // Slot value is not confirmed
            const slotToConfirm = "SEL_SERVICE";
            const speechOutput = `You want the ${intentObj.slots.SEL_SERVICE.value} service, is that correct?`;
            const repromptSpeech = speechOutput;
            this.handler.emit(":confirmSlot", slotToConfirm, speechOutput, repromptSpeech);
        }
    }

    async procedureElicit(intentObj: Alexa.Intent, goFull: boolean, invalid: boolean): Promise<void> {
        const services = await this.procedureRepository.findAll();
        const invalidSpeech = (invalid) ? `Unfortunately that's not a service I can identify.` : ``;
        const repromptSpeech = `${invalidSpeech} Our most popular services are: ${this.getRecommendedProcedures(services)}. I've sent the complete list of services to your Alexa App. What service would you like to book?`;
        console.info(repromptSpeech);
        const elicit: Elicit = <Elicit>{
            slotToElicit: "SEL_SERVICE",
            repromptSpeech: repromptSpeech,
            speechOutput: (goFull || invalid) ? repromptSpeech : "What service would you like to book?",
            cardContent: `${this.getFullProcedures(services)}`,
            cardTitle: "Available Services",
            updatedIntent: intentObj,
            /*  imageObj: {
                  smallImageUrl: "https://imgs.xkcd.com/comics/standards.png",
                  largeImageUrl: "https://imgs.xkcd.com/comics/standards.png"
              }*/
        };

        this.handler.emit(":elicitSlotWithCard", elicit.slotToElicit, elicit.speechOutput, elicit.repromptSpeech, elicit.cardTitle, elicit.cardContent, elicit.updatedIntent, elicit.imageObj);

    }

    async handleProcedureMatch(intentObj: Alexa.Intent): Promise<void> {
        if (!!intentObj.slots.SEL_SERVICE.value) {
            if (intentObj.slots.SEL_SERVICE.resolutions &&
                intentObj.slots.SEL_SERVICE.resolutions.resolutionsPerAuthority &&
                intentObj.slots.SEL_SERVICE.resolutions.resolutionsPerAuthority[0] &&
                intentObj.slots.SEL_SERVICE.resolutions.resolutionsPerAuthority[0].status &&
                intentObj.slots.SEL_SERVICE.resolutions.resolutionsPerAuthority[0].status.code &&
                intentObj.slots.SEL_SERVICE.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH") {
                this.handleProcedureSlotConfirmation(intentObj);
            }
            else {
                await this.procedureElicit(intentObj, true, true);
            }
        }
        else {
            await this.procedureElicit(intentObj, false, false);
        }
    }
}