import * as Alexa from "alexa-sdk";
import { SessionHelper } from "../helpers";
import { AlexaResponse, Service } from "../models";
import {AppointmentRequest, ElementRules} from "../models/dto";
import { ProcedureRepository } from "../repositories";

// Procedure a.k.a Service
export class ProcedureService {

    procedureRepository: ProcedureRepository;
    handler: Alexa.Handler<Alexa.Request>;

    constructor(handler: Alexa.Handler<Alexa.Request>) {
        this.handler = handler;
        this.procedureRepository = new ProcedureRepository();
    }

    getPopularProcedures(services: Array<Service>): string {
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

    async procedureListing(): Promise<void> {

        const procedures = await this.procedureRepository.findAll();
        const repromptSpeech = await this.getListingQuestionMessage();
        const speech = `We have the following services available: ${this.getPopularProcedures(procedures)}. I've sent the full list of services to the Alexa App. ${repromptSpeech}`;

        const alexaResponse: AlexaResponse = <AlexaResponse>{
            repromptSpeech: repromptSpeech,
            speechOutput: speech,
            cardContent: `${this.getFullProcedures(procedures)}`,
            cardTitle: "Available Services",
        };

        this.handler.emit(":askWithCard",  alexaResponse.speechOutput, alexaResponse.repromptSpeech, alexaResponse.cardTitle, alexaResponse.cardContent,  alexaResponse.imageObj);
    }

    async getListingQuestionMessage(): Promise<String> {
        // we try to get the SEL BRANCH value from the BookAppointmentInt session
        const slot = SessionHelper.getMatchedSlotValue(this.handler, "BookAppointmentIntent", "SEL_SERVICE");
        // if branch in session
        if (!!slot && slot.confirmationStatus === "CONFIRMED") {
            return `I have ${slot.realValue} as your desired service for this appointment, say "continue" to resume your booking, or "change service" to modify it`;
        }
        else {
            return `Say continue to resume your booking`;
        }
    }

    async handleProcedureSlotConfirmation(intentObj: Alexa.Intent): Promise<void> {
        if (intentObj.slots.SEL_SERVICE.confirmationStatus === "DENIED") {
            await this.procedureElicit(intentObj, true, false);
        } else {
            // Slot value is not successMatch
            const slotToConfirm = "SEL_SERVICE";
            const speechOutput = `You want the ${SessionHelper.getMatchedSlotValue(this.handler, intentObj.name, "SEL_SERVICE").realValue } service, is that correct?`;
            const repromptSpeech = speechOutput;
            this.handler.emit(":confirmSlot", slotToConfirm, speechOutput, repromptSpeech, intentObj);
        }
    }

    async procedureElicit(intentObj: Alexa.Intent, listAllItems: boolean, indicatePreviousMatchInvalid: boolean, previousMatchInvalidMessage: string = ""): Promise<void> {
        const services = await this.procedureRepository.findAll();
        const invalidSpeech = (indicatePreviousMatchInvalid) ? (previousMatchInvalidMessage === "") ? `Unfortunately that's not a service I can identify.` : previousMatchInvalidMessage : ``;
        // TODO: add randomize to question
        const questionSpeech = `What service would you like to book?`;
        const listAllSpeech = `Our most popular services are: ${this.getPopularProcedures(services)}. I've sent the complete list of services to your Alexa App.`;
        const repromptSpeech = `${invalidSpeech} ${(listAllItems) ? listAllSpeech : "" }  ${questionSpeech}`;
        console.info(repromptSpeech);
        const elicit: AlexaResponse = <AlexaResponse>{
            slotToElicit: "SEL_SERVICE",
            repromptSpeech: repromptSpeech,
            speechOutput: (listAllItems || indicatePreviousMatchInvalid) ? repromptSpeech : `${questionSpeech}`,
            cardContent: `${this.getFullProcedures(services)}`,
            cardTitle: "Available Services",
            updatedIntent: intentObj,
            /*  imageObj: {
                  smallImageUrl: "https://imgs.xkcd.com/comics/standards.png",
                  largeImageUrl: "https://imgs.xkcd.com/comics/standards.png"
              }*/
        };
        console.info("intent before service elicit");
        console.info(intentObj);
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

    public checkProcedureRules(request: AppointmentRequest): ElementRules {
        const procedureViability: ElementRules = {
            name: "SEL_SERVICE",
            reason: "",
            valid: true
        };
        if (request.selService !== "N/A") {
            // check SEL_SERVICE possible in SEL_BRANCH
            // check SEL_SERVICE possible in SEL_ASSESSOR
            // check SEL_SERVICE possible in DATE
            // check SEL_SERVICE possible in TIME
        }
        return procedureViability;
    }
}