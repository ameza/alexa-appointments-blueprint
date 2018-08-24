import * as Alexa from "alexa-sdk";
import { Assessor, AlexaResponse } from "../models";
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

    async handleAssessorSlotConfirmation(intentObj: Alexa.Intent): Promise<void> {
        if (intentObj.slots.SEL_ASSESSOR.confirmationStatus === "DENIED") {
            await this.assessorElicit(intentObj, true, false);
        } else {
            // Slot value is not confirmed
            const slotToConfirm = "SEL_ASSESSOR";
            const speechOutput = `You want to book with ${intentObj.slots.SEL_ASSESSOR.value}, is that correct?`;
            const repromptSpeech = speechOutput;
            this.handler.emit(":confirmSlot", slotToConfirm, speechOutput, repromptSpeech);
        }
    }

    async assessorElicit(intentObj: Alexa.Intent, goFull: boolean, invalid: boolean): Promise<void> {
        const assessors = await this.assessorRepository.findAll();
        const invalidSpeech = (invalid) ? `I'm sorry, I couldn't find that assessor.` : ``;
        const repromptSpeech = `${invalidSpeech} Currently we have the following assessors available: ${ this.getPopularAssessors(assessors)}. I've sent the complete list of assessors to your Alexa App. Who would you like to book with?`;
        const elicit: AlexaResponse = <AlexaResponse>{
            slotToElicit: "SEL_ASSESSOR",
            repromptSpeech: repromptSpeech,
            speechOutput: (goFull || invalid) ? repromptSpeech : "Who would you like to assist you?",
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


}