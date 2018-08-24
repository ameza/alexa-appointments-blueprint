import * as Alexa from "alexa-sdk";
import * as moment  from "moment";
import { AlexaResponse } from "../models";
import { TimeRepository } from "../repositories";

export class TimeService {
    timeRepository: TimeRepository;
    handler: Alexa.Handler<Alexa.Request>;

    constructor(handler: Alexa.Handler<Alexa.Request>) {
        this.handler = handler;
        this.timeRepository = new TimeRepository();
    }

    // TIME

    handleTimeSlotConfirmation(intentObj: Alexa.Intent): void {
        if (intentObj.slots.SEL_TIME.confirmationStatus === "DENIED") {
            this.timeElicit(intentObj, true, false);
        } else {
            // Slot value is not confirmed
            const slotToConfirm = "SEL_TIME";
            const speechOutput = `You want to book at ${intentObj.slots.SEL_TIME.value}, is that correct?`;
            const repromptSpeech = speechOutput;
            this.handler.emit(":confirmSlot", slotToConfirm, speechOutput, repromptSpeech);
        }
    }

    async timeElicit(intentObj: Alexa.Intent, goFull: boolean, invalid: boolean): Promise<void> {
        const times = "14:00, 14:30 and 15:00";
        const invalidSpeech = (invalid) ? `That doesn't look like a valid time` : ``;
        const repromptSpeech = `${invalidSpeech} Some available slots on this date are: ${times}. I've sent a list of available times for this day to your Alexa App. What is your time preference for this appointment,`;
        const elicit: AlexaResponse = <AlexaResponse>{
            slotToElicit: "SEL_TIME",
            repromptSpeech: repromptSpeech,
            speechOutput: (goFull || invalid) ? repromptSpeech : "At what time would you like to book?",
            cardContent: `${times}`,
            cardTitle: "Available Times",
            updatedIntent: intentObj,
            /*  imageObj: {
                  smallImageUrl: "https://imgs.xkcd.com/comics/standards.png",
                  largeImageUrl: "https://imgs.xkcd.com/comics/standards.png"
              }*/
        };

        this.handler.emit(":elicitSlotWithCard", elicit.slotToElicit, elicit.speechOutput, elicit.repromptSpeech, elicit.cardTitle, elicit.cardContent, elicit.updatedIntent, elicit.imageObj);

    }

    async handleTimeMatch(intentObj: Alexa.Intent): Promise<void> {
        if (!!intentObj.slots.SEL_TIME.value) {
            console.info(intentObj.slots.SEL_TIME);
            if (moment(intentObj.slots.SEL_TIME.value, "hh:mm").isValid() === true) {
                console.info("time confirm");
                this.handleTimeSlotConfirmation(intentObj);
            }
            else {
                console.info("elicit 1");
                await this.timeElicit(intentObj, true, true);
            }
        }
        else {
            console.info("elicit 2");
            await this.timeElicit(intentObj, false, false);
        }
    }
}