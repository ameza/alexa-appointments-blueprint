import * as Alexa from "alexa-sdk";
import {SessionHelper} from "../helpers";
import { AlexaResponse, Assessor } from "../models";
import { AppointmentRequest, ElementRules} from "../models/dto";
import { AssessorRepository } from "../repositories";

export class AssessorService {
    assessorRepository: AssessorRepository;
    handler: Alexa.Handler<Alexa.Request>;

    constructor(handler: Alexa.Handler<Alexa.Request>) {
        this.handler = handler;
        this.assessorRepository = new AssessorRepository();
    }

    // ASSESSOR

    getPopularAssessors(assessors: Array<Assessor>): string {
        const recommended = assessors.filter((x) => x.enabled && x.popular === true);
        if (recommended.length === 1) {
            return recommended.pop().value;
        }
        else {
            const last = recommended.pop();
            return ` ${recommended.map(x => {  return x.value; }).join(", ")} and ${last.value}`;
        }
    }

    getFullAssessors(assessors: Array<Assessor>): string {
        const all = assessors.filter((x) => x.enabled);
        return ` ${all.map( x => { return x.value; }).join("\r\n")}`;
    }

    async assessorListing(): Promise<void> {

        const assessors = await this.assessorRepository.findAll();
        const repromptSpeech = await this.getListingQuestionMessage();
        const speech = `Our most popular doctors are: ${this.getPopularAssessors(assessors)}. I've sent the full list of doctors to the Alexa App. ${repromptSpeech}`;

        const alexaResponse: AlexaResponse = <AlexaResponse>{
            repromptSpeech: repromptSpeech,
            speechOutput: speech,
            cardContent: `${this.getFullAssessors(assessors)}`,
            cardTitle: "Available Doctors",
        };

        this.handler.emit(":askWithCard",  alexaResponse.speechOutput, alexaResponse.repromptSpeech, alexaResponse.cardTitle, alexaResponse.cardContent,  alexaResponse.imageObj);
    }

    async getListingQuestionMessage(): Promise<String> {
        // we try to get the SEL BRANCH value from the BookAppointmentInt session
        const slot = SessionHelper.getMatchedSlotValue(this.handler, "BookAppointmentIntent", "SEL_ASSESSOR");
        // if branch in session
        if (!!slot && slot.confirmationStatus === "CONFIRMED") {
            return `I have ${slot.realValue} as your Doctor for this appointment, say "continue" to resume your booking, or "change assessor" to choose a different one`;
        }
        else {
            return `Say continue to resume your booking`;
        }
    }

    async handleAssessorSlotConfirmation(intentObj: Alexa.Intent): Promise<void> {
        if (intentObj.slots.SEL_ASSESSOR.confirmationStatus === "DENIED") {
            await this.assessorElicit(intentObj, true, false);
        } else {
            // Slot value is not successMatch
            const slotToConfirm = "SEL_ASSESSOR";
            const speechOutput = `You want to book with ${SessionHelper.getMatchedSlotValue(this.handler, intentObj.name, "SEL_ASSESSOR").realValue }, is that correct?`;
            const repromptSpeech = speechOutput;
            this.handler.emit(":confirmSlot", slotToConfirm, speechOutput, repromptSpeech, intentObj);
        }
    }

    async assessorElicit(intentObj: Alexa.Intent, listAllItems: boolean, indicatePreviousMatchInvalid: boolean, previousMatchInvalidMessage: string = ""): Promise<void> {
        const assessors = await this.assessorRepository.findAll();
        const invalidSpeech = (indicatePreviousMatchInvalid) ? (previousMatchInvalidMessage === "") ? `I'm sorry, I couldn't find that assessor.` : previousMatchInvalidMessage : ``;
        // TODO: add randomize to question
        const questionSpeech = `Who would you like to assist you?`;
        const listAllSpeech = `Currently we have the following assessors available: ${ this.getPopularAssessors(assessors)}. I've sent the complete list of assessors to your Alexa App.`;
        const repromptSpeech = `${invalidSpeech} ${(listAllItems) ? listAllSpeech : "" }  ${questionSpeech}`;
        const elicit: AlexaResponse = <AlexaResponse>{
            slotToElicit: "SEL_ASSESSOR",
            repromptSpeech: repromptSpeech,
            speechOutput: (listAllItems || indicatePreviousMatchInvalid) ? repromptSpeech : `${questionSpeech}`,
            cardContent: `${this.getFullAssessors(assessors)}`,
            cardTitle: "Available Assessors",
            updatedIntent: intentObj,
            /*  imageObj: {
                  smallImageUrl: "https://imgs.xkcd.com/comics/standards.png",
                  largeImageUrl: "https://imgs.xkcd.com/comics/standards.png"
              }*/
        };

        this.handler.emit(":elicitSlotWithCard", elicit.slotToElicit, elicit.speechOutput, elicit.repromptSpeech, elicit.cardTitle, elicit.cardContent, elicit.updatedIntent, elicit.imageObj);

    }

    async handleAssessorMatch(intentObj: Alexa.Intent): Promise<void> {
        if (!!intentObj.slots.SEL_ASSESSOR.value) {
            if (intentObj.slots.SEL_ASSESSOR.resolutions &&
                intentObj.slots.SEL_ASSESSOR.resolutions.resolutionsPerAuthority &&
                intentObj.slots.SEL_ASSESSOR.resolutions.resolutionsPerAuthority[0] &&
                intentObj.slots.SEL_ASSESSOR.resolutions.resolutionsPerAuthority[0].status &&
                intentObj.slots.SEL_ASSESSOR.resolutions.resolutionsPerAuthority[0].status.code &&
                intentObj.slots.SEL_ASSESSOR.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH") {
                await this.handleAssessorSlotConfirmation(intentObj);
            }
            else {
                await this.assessorElicit(intentObj, true, true);
            }
        }
        else {
            await this.assessorElicit(intentObj, false, false);
        }
    }

    public checkAssessorRules(request: AppointmentRequest): ElementRules {
        const asssessorViability: ElementRules = {
            name: "SEL_SERVICE",
            reason: "",
            valid: true
        };
        if (request.selAssessor !== "N/A") {
            // check SEL_ASSESSOR possible in SEL_BRANCH
            // check SEL_ASSESSOR possible in SEL_SERVICE
            // check SEL_ASSESSOR possible in SEL_DATE
            // check SEL_ASSESSOR possible in SEL_TIME
        }
        return asssessorViability;
    }


}