import * as Alexa from "alexa-sdk";
import { AlexaResponse, Branch } from "../models";

import {
    BranchRepository
} from "../repositories";

export class BranchService {

    branchRepository: BranchRepository;
    handler: Alexa.Handler<Alexa.Request>;

    constructor(handler: Alexa.Handler<Alexa.Request>) {
        this.handler = handler;
        this.branchRepository = new BranchRepository();
    }

    // BRANCH

    getPopularBranches(branches: Array<Branch>): string {
        const recommended = branches.filter((x) => x.enabled && x.popular === true);
        if (recommended.length === 1) {
            return recommended.pop().value;
        }
        else {
            const last = recommended.pop();
            return ` ${recommended.map(x => {  return x.value; }).join(", ")} and ${last.value}`;
        }
    }

    getFullBranches(branches: Array<Branch>): string {
        const all = branches.filter((x) => x.enabled);
        return ` ${all.map( x => { return x.value; }).join("\r\n")}`;
    }

    async branchElicit(intentObj: Alexa.Intent, listAllItems: boolean, indicatePreviousMatchInvalid: boolean): Promise<void> {
        const branches = await this.branchRepository.findAll();
        const invalidSpeech = (indicatePreviousMatchInvalid) ?  `I couldn't match that with any of our locations.` : ``;
        const questionSpeech =  `Where would you like to book your appointment?`;
        const repromptSpeech = `${invalidSpeech} Our most popular locations are: ${this.getPopularBranches(branches)}. I've sent the complete list of locations to the Alexa App. ${questionSpeech}`;

        const elicit: AlexaResponse = <AlexaResponse>{
            slotToElicit: "SEL_BRANCH",
            repromptSpeech: repromptSpeech,
            speechOutput: (listAllItems) ? repromptSpeech : `${questionSpeech}`,
            cardContent: `${this.getFullBranches(branches)}`,
            cardTitle: "Available Offices / Locations",
            updatedIntent: intentObj,
            /* imageObj: {
                 smallImageUrl: "https://imgs.xkcd.com/comics/standards.png",
                 largeImageUrl: "https://imgs.xkcd.com/comics/standards.png"
             }*/
        };

        this.handler.emit(":elicitSlotWithCard", elicit.slotToElicit, elicit.speechOutput, elicit.repromptSpeech, elicit.cardTitle, elicit.cardContent, elicit.updatedIntent, elicit.imageObj);
    }

    async branchListing() {
        const branches = await this.branchRepository.findAll();
        const repromptSpeech =  `You can say: book an appointment on... followed by your location of preference. Check your alexa app for the full list`;
        const speech = `Our most popular locations are: ${this.getPopularBranches(branches)}. I've sent the complete list of locations to the Alexa App. ${repromptSpeech}`;

        const alexaResponse: AlexaResponse = <AlexaResponse>{
            repromptSpeech: repromptSpeech,
            speechOutput: speech,
            cardContent: `${this.getFullBranches(branches)}`,
            cardTitle: "Available Offices / Locations",
        };

        this.handler.emit(":askWithCard",  alexaResponse.speechOutput, alexaResponse.repromptSpeech, alexaResponse.cardTitle, alexaResponse.cardContent, alexaResponse.imageObj);

    }

    handleBranchSlotConfirmation(intentObj: Alexa.Intent): void {

        if (intentObj.slots.SEL_BRANCH.confirmationStatus === "DENIED") {
            this.branchElicit(intentObj, true, false);
        }
        else {
            // Slot value is not confirmed
            const slotToConfirm = "SEL_BRANCH";
            const speechOutput = `I heard you would like to book in our ${intentObj.slots.SEL_BRANCH.value} office, is that correct?`;
            const repromptSpeech = speechOutput;
            this.handler.emit(":confirmSlot", slotToConfirm, speechOutput, repromptSpeech);
        }
    }

    async handleBranchMatch(intentObj: Alexa.Intent ): Promise<void> {
        if (!!intentObj.slots.SEL_BRANCH.value) {
            if (intentObj.slots.SEL_BRANCH.resolutions &&
                intentObj.slots.SEL_BRANCH.resolutions.resolutionsPerAuthority &&
                intentObj.slots.SEL_BRANCH.resolutions.resolutionsPerAuthority[0] &&
                intentObj.slots.SEL_BRANCH.resolutions.resolutionsPerAuthority[0].status &&
                intentObj.slots.SEL_BRANCH.resolutions.resolutionsPerAuthority[0].status.code &&
                intentObj.slots.SEL_BRANCH.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH") {
                this.handleBranchSlotConfirmation(intentObj);
            }
            else {
                await this.branchElicit(intentObj, true, true);
            }
        }
        else {
            await this.branchElicit(intentObj, false, false);
        }
    }
}