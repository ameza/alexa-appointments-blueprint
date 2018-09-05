import * as Alexa from "alexa-sdk";
import * as moment  from "moment";
import { UtilityHelpers } from "../helpers";
import { AlexaResponse } from "../models";
import { AppointmentRequest, ElementRules, RuleCheckResult } from "../models/dto";
import { TimeRepository } from "../repositories";

export class TimeService {
    timeRepository: TimeRepository;
    handler: Alexa.Handler<Alexa.Request>;

    constructor(handler: Alexa.Handler<Alexa.Request>) {
        this.handler = handler;
        this.timeRepository = new TimeRepository();
    }

    // TIME

    async handleTimeSlotConfirmation(intentObj: Alexa.Intent): Promise<void> {
        if (intentObj.slots.SEL_TIME.confirmationStatus === "DENIED") {
            await this.timeElicit(intentObj, true, false);
        } else {
            // Slot value is not successMatch
            const slotToConfirm = "SEL_TIME";
            const speechOutput = `You want to book at ${UtilityHelpers.formatTime(intentObj.slots.SEL_TIME.value)}, is that correct?`;
            const repromptSpeech = speechOutput;
            this.handler.emit(":confirmSlot", slotToConfirm, speechOutput, repromptSpeech, intentObj);
        }
    }

    async timeElicit(intentObj: Alexa.Intent, listAllItems: boolean, indicatePreviousMatchInvalid: boolean, previousMatchInvalidMessage: string = ""): Promise<void> {
        const times = "14:00, 14:30 and 15:00";
        const invalidSpeech = (indicatePreviousMatchInvalid) ? (previousMatchInvalidMessage === "") ? `That doesn't look like a valid time` : previousMatchInvalidMessage : ``;
        const questionSpeech = `What is your time preference for this appointment?`;
        const allItemsSpeech = `Some available slots on this date are: ${times}. I've sent a list of available times for this day to your Alexa App.`;
        const repromptSpeech = `${invalidSpeech} ${(listAllItems) ? allItemsSpeech : "" }  ${questionSpeech}`;
        const elicit: AlexaResponse = <AlexaResponse>{
            slotToElicit: "SEL_TIME",
            repromptSpeech: repromptSpeech,
            speechOutput: (listAllItems || indicatePreviousMatchInvalid) ? repromptSpeech : `${questionSpeech}`,
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
                await this.handleTimeSlotConfirmation(intentObj);
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

    /// This method only checks static rules, free spaces shouldn't be verified here
    public checkTimeRules(request: AppointmentRequest): ElementRules {
        const timeRules: ElementRules = {
            name: "SEL_TIME",
            reason: "",
            valid: true
        };
        if (request.selTime !== "N/A") {
            // check SEL_TIME possible in SEL_BRANCH
            // check SEL_TIME possible in SEL_SERVICE
            // check SEL_TIME possible in SEL_ASSESSOR
            // check SEL_TIME possible in SEL_DATE

           const timePossibleInBranch =  this.checkTimePossibleInBranch(request);
           if (!timePossibleInBranch.valid) {
               timeRules.reason = timePossibleInBranch.message;
               timeRules.valid = false;
           } else {
               const timePossibleInService = this.checkTimePossibleInService(request);
               if (!timePossibleInService.valid) {
                   timeRules.reason = timePossibleInService.message;
                   timeRules.valid = false;
               } else {
                   const timePossibleInAssessor = this.checkTimePossibleInAssessor(request);
                   if (!timePossibleInAssessor.valid) {
                       timeRules.reason = timePossibleInAssessor.message;
                       timeRules.valid = false;
                   } else {
                       const timePossibleInDate = this.checkTimePossibleInDate(request);
                       if (!timePossibleInDate.valid) {
                           timeRules.reason =  timePossibleInDate.message;
                           timeRules.valid = false;
                       }
                   }
               }
           }
        }
        return timeRules;
    }

    // custom rules can be added in the following methods, based on db calls

    private checkTimePossibleInBranch(request: AppointmentRequest): RuleCheckResult {

        const check: RuleCheckResult = { valid: true, message: ""};
        // TODO: get real business hours

        const format = "hh:mm";

        let time = moment(request.selTime, format),
            beforeTime = moment("08:00", format),
            afterTime = moment("18:00", format);

        if (!time.isBetween(beforeTime, afterTime)) {
            check.message = `${request.selBranch} is not open at ${request.selTime}. Attention hours go from 08:00 to 18:00.`;
            check.valid = false;
        }

        return check;

    }

    private checkTimePossibleInService(request: AppointmentRequest): RuleCheckResult {
        const check: RuleCheckResult = { valid: true, message: ""};

        // TODO: get real service hours
        if (true) {

        }
        else {
            check.message = `${request.selService} is not provided at ${request.selTime}. Service is provided at noon only.`;
            check.valid = false;
        }

        return check;

    }

    private checkTimePossibleInAssessor(request: AppointmentRequest): RuleCheckResult {
        const check: RuleCheckResult = { valid: true, message: ""};

        // TODO: get real assessor hours
        if (true) {

        }
        else {
            check.message = `${request.selAssessor} is not available at ${request.selTime}. ${request.selAssessor} working hours go from 13:00 to 18:00.`;
            check.valid = false;
        }

        return check;
    }

    private checkTimePossibleInDate(request: AppointmentRequest): RuleCheckResult {
        const check: RuleCheckResult = { valid: true, message: ""};

        // TODO: get real date hours
        if (true) {

        }
        else {
            check.message = `${request.selTime} is not available on ${request.selDate}. Attention hours for ${request.selDate} go from 08:00 to 12:00.`;
            check.valid = false;
        }

        return check;
    }
}