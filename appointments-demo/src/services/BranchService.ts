import * as Alexa from "alexa-sdk";
import { Branch, Elicit } from "../models";

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

    getRecommendedBranches(branches: Array<Branch>): string {
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

    async branchElicit(intentObj: Alexa.Intent, goFull: boolean, invalid: boolean): Promise<void> {
        const branches = await this.branchRepository.findAll();
        const invalidSpeech = (invalid) ?  `I couldn't match that with any of our locations.` : ``;
        const repromptSpeech = `${invalidSpeech} Our most popular locations are: ${this.getRecommendedBranches(branches)}. I've sent the complete list of locations to the Alexa App. Where would you like to book your appointment?`;

        const elicit: Elicit = <Elicit>{
            slotToElicit: "SEL_BRANCH",
            repromptSpeech: repromptSpeech,
            speechOutput: (goFull) ? repromptSpeech : "Where would you like to book your appointment?",
            cardContent: `${this.getFullBranches(branches)}`,
            cardTitle: "Available Offices",
            updatedIntent: intentObj,
            /* imageObj: {
                 smallImageUrl: "https://imgs.xkcd.com/comics/standards.png",
                 largeImageUrl: "https://imgs.xkcd.com/comics/standards.png"
             }*/
        };

        this.handler.emit(":elicitSlotWithCard", elicit.slotToElicit, elicit.speechOutput, elicit.repromptSpeech, elicit.cardTitle, elicit.cardContent, elicit.updatedIntent, elicit.imageObj);

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