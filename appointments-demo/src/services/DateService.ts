import * as Alexa from "alexa-sdk";
import * as moment  from "moment";
import { AlexaResponse } from "../models";
import { AppointmentRequest, ElementRules} from "../models/dto";
import { DateRepository } from "../repositories";

export class DateService {
    dateRepository: DateRepository;
    handler: Alexa.Handler<Alexa.Request>;

    constructor(handler: Alexa.Handler<Alexa.Request>) {
        this.handler = handler;
        this.dateRepository = new DateRepository();
    }

    // DATE

    async handleDateSlotConfirmation(intentObj: Alexa.Intent): Promise<void> {
        if (intentObj.slots.SEL_DATE.confirmationStatus === "DENIED") {
            await this.dateElicit(intentObj, true, false);
        } else {
            // Slot value is not successMatch
            const slotToConfirm = "SEL_DATE";
            const speechOutput = `You want to book on ${intentObj.slots.SEL_DATE.value}, is that correct?`;
            const repromptSpeech = speechOutput;
            this.handler.emit(":confirmSlot", slotToConfirm, speechOutput, repromptSpeech, intentObj);
        }
    }

    async dateElicit(intentObj: Alexa.Intent, listAllItems: boolean, indicatePreviousMatchInvalid: boolean, previousMatchInvalidMessage: string = ""): Promise<void> {
        const dates = "05/12/2018, 06/12/2018 and 07/12/2018";
        const invalidSpeech = (indicatePreviousMatchInvalid) ? (previousMatchInvalidMessage === "") ? `I'm sorry, I couldn't find that date. You must provide an specific date` : previousMatchInvalidMessage : ``;
        // TODO: add randomize to question
        const questionSpeech =  "On what date would you like to book?";
        const listAllSpeech = `I have some space on the following dates: ${dates}. I've sent a list of available dates to your Alexa App.`;
        const repromptSpeech = `${invalidSpeech} ${(listAllItems) ? listAllSpeech : "" }  ${questionSpeech}`;
        const elicit: AlexaResponse = <AlexaResponse>{
            slotToElicit: "SEL_DATE",
            repromptSpeech: repromptSpeech,
            speechOutput: (listAllItems || indicatePreviousMatchInvalid) ? repromptSpeech : `${questionSpeech}`,
            cardContent: `${dates}`,
            cardTitle: "Available Dates",
            updatedIntent: intentObj,
            /* imageObj: {
                 smallImageUrl: "https://imgs.xkcd.com/comics/standards.png",
                 largeImageUrl: "https://imgs.xkcd.com/comics/standards.png"
             }*/
        };

        this.handler.emit(":elicitSlotWithCard", elicit.slotToElicit, elicit.speechOutput, elicit.repromptSpeech, elicit.cardTitle, elicit.cardContent, elicit.updatedIntent, elicit.imageObj);

    }

    async handleDateMatch(intentObj: Alexa.Intent): Promise<void> {
        if (!!intentObj.slots.SEL_DATE.value) {

            console.info(intentObj.slots.SEL_DATE.value);

            if (moment(intentObj.slots.SEL_DATE.value, "YYYY-MM-DD", true).isValid() === true) {
                console.info("confirm");
                this.handleDateSlotConfirmation(intentObj);
            }
            else {
                console.info("entro");
                await this.dateElicit(intentObj, true, true);
            }
        }
        else {
            await this.dateElicit(intentObj, false, false);
        }
    }

    public checkDateRules(request: AppointmentRequest): ElementRules {
        const dateViability: ElementRules = {
            name: "SEL_DATE",
            reason: "",
            valid: true
        };
        if (request.selDate !== "N/A") {
            // check SEL_DATE possible in SEL_BRANCH
            // check SEL_DATE possible in SEL_SERVICE
            // check SEL_DATE possible in SEL_ASSESSOR
            // check SEL_DATE possible in SEL_TIME
        }
        return dateViability;
    }
}