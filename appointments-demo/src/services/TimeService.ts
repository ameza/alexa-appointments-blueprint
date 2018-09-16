import * as Alexa from "alexa-sdk";
import * as moment  from "moment";
import { SessionHelper, UtilityHelpers} from "../helpers";
import {AlexaResponse, NextAvailable, Service} from "../models";
import { AppointmentRequest, ElementRules, RuleCheckResult } from "../models/dto";
import { AppointmentRepository, TimeRepository} from "../repositories";


export class TimeService {
      timeRepository: TimeRepository;
    appointmentRepository: AppointmentRepository;
    handler: Alexa.Handler<Alexa.Request>;

    constructor(handler: Alexa.Handler<Alexa.Request>) {
        this.handler = handler;
        this.appointmentRepository = new AppointmentRepository();
        this.timeRepository = new TimeRepository();
    }

    roundTimeToNearestHalfHour(selTime: string) {
        const start = moment(selTime, "hh:mm");

        const remainder = 30 - (start.minute() % 30);
        console.info(`time remainder: ${remainder}`);
        if (remainder === 30) {
            return selTime;
        }
        else {
            return moment(start).add(remainder, "minutes").format("HH:mm");
        }


    }

    // TIME

    async handleTimeSlotConfirmation(intentObj: Alexa.Intent): Promise<void> {
        if (intentObj.slots.SEL_TIME.confirmationStatus === "DENIED") {
            await this.timeElicit(intentObj, true, false);
        } else {
            // Slot value is not successMatch
            const slotToConfirm = "SEL_TIME";

            // Round time before confirmation
            intentObj.slots.SEL_TIME.value = this.roundTimeToNearestHalfHour(UtilityHelpers.formatTime(intentObj.slots.SEL_TIME.value));
            const speechOutput = `You want to book at ${intentObj.slots.SEL_TIME.value}, is that correct?`;
            const repromptSpeech = speechOutput;
            this.handler.emit(":confirmSlot", slotToConfirm, speechOutput, repromptSpeech, intentObj);
        }
    }

    async timeElicit(intentObj: Alexa.Intent, listAllItems: boolean, indicatePreviousMatchInvalid: boolean, previousMatchInvalidMessage: string = ""): Promise<void> {

        const currentDate =  intentObj.slots.SEL_DATE.value;
        const currentAssessor = SessionHelper.getMatchedSlotValue(this.handler, intentObj.name, "SEL_ASSESSOR").realValue;
        const currentBranch = SessionHelper.getMatchedSlotValue(this.handler, intentObj.name, "SEL_BRANCH").realValue;

        console.info(`about to retrieve available date for date: ${currentDate} and assessor: ${currentAssessor}`);

        const availableHours = await this.getAvailableHours(currentDate, currentAssessor, currentBranch);

        let times = "";
        let fulltimes = "";

        if (availableHours.length === 0) {
            console.info("unable to list items do date fully booked");
            listAllItems = false;
        }
        else {
           fulltimes = await this.getAvailableHourListed(availableHours);
           for (let c = 0; c < 3; c++) {
               if (availableHours[c]) {
                   if (c === 1) {
                       times = `${times}${availableHours[c]} and `;
                   } else {
                       times = `${times}${availableHours[c]}, `;
                   }
               }
           }
        }


        const invalidSpeech = (indicatePreviousMatchInvalid) ? (previousMatchInvalidMessage === "") ? `That doesn't look like a valid time` : previousMatchInvalidMessage : ``;
        const questionSpeech = `What is your time preference for this appointment? Your selection will be rounded to the closest half hour`;
        const allItemsSpeech = `Some available slots on this date are: ${times}. I've sent a list of available times for this day to your Alexa App.`;
        const repromptSpeech = `${invalidSpeech} ${(listAllItems) ? allItemsSpeech : "" }  ${questionSpeech}`;
        const elicit: AlexaResponse = <AlexaResponse>{
            slotToElicit: "SEL_TIME",
            repromptSpeech: repromptSpeech,
            speechOutput: (listAllItems || indicatePreviousMatchInvalid) ? repromptSpeech : `${questionSpeech}`,
            cardContent: `${fulltimes}`,
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
        let time = moment(request.selTime, format);


        // opening hours rule
        let beforeTime = moment("08:00", format);
        let afterTime = moment("18:00", format);

        if (!time.isBetween(beforeTime, afterTime, undefined, "[)")) {
            check.message = `${request.selBranch} is not open at ${request.selTime}. Attention hours go from 08:00 to 18:00.`;
            check.valid = false;
        }

        // previous time rule
        beforeTime = moment(new Date(), format).utcOffset("-06:00");
        afterTime = moment("18:00", format);

        if (!time.isBetween(beforeTime, afterTime, undefined, "[)")) {
            check.message = `booking at a previous time is not allowed, server time ${beforeTime.format(format)}`;
            check.valid = false;
        }

        return check;

    }

    private checkTimePossibleInService(request: AppointmentRequest): RuleCheckResult {
        const check: RuleCheckResult = { valid: true, message: ""};

        // TODO: get real service hours
        if (!true) {
            check.message = `${request.selService} is not provided at ${request.selTime}. Service is provided at noon only.`;
            check.valid = false;
        }

        return check;

    }

    private checkTimePossibleInAssessor(request: AppointmentRequest): RuleCheckResult {
        const check: RuleCheckResult = { valid: true, message: ""};

        // lopez rule only works from 13 to 18
        const format = "hh:mm";
        let time = moment(request.selTime, format),
            beforeTime = moment("13:00", format),
            afterTime = moment("18:00", format);
        // TODO: get real assessor hours
        if (request.selAssessor.toLowerCase().indexOf("lopez") > -1 && !time.isBetween(beforeTime, afterTime, undefined, "[)")) {
            check.message = `${request.selAssessor} is not available at ${request.selTime}. ${request.selAssessor} working hours go from 13:00 to 18:00.`;
            check.valid = false;
        }

        return check;
    }

    private checkTimePossibleInDate(request: AppointmentRequest): RuleCheckResult {
        const check: RuleCheckResult = { valid: true, message: ""};

        // TODO: get real date hours
        if (!true) {
            check.message = `${request.selTime} is not available on ${request.selDate}. Attention hours for ${request.selDate} go from 08:00 to 12:00.`;
            check.valid = false;
        }

        return check;
    }

    // final availability check

    public async getAvailableHours(selDate: string, selAssessor: string, selBranch: string): Promise<string[]> {
        const possibleHours = this.generateArrayOfPossibleHours();
        const dateAppointments = await this.appointmentRepository.findAppointmentsByDate(selDate, selAssessor, selBranch);
        const filteredHours = possibleHours.filter((el) => dateAppointments.map((item) => item.startTime).indexOf(el) < 0);

        console.info(`available hours found`);
        console.info(filteredHours);
        return filteredHours;
    }

    public async getAvailableHourListed(availableHours: string[]): Promise<string> {
        return ` ${availableHours.map( x => { return x; }).join("\r\n")}`;
    }

    private generateArrayOfPossibleHours(): string[] {
        // TODO: replace here for real start and closing hours by branch
        const hoursArray: string[] = [];
        for (let hour = 8; hour < 18; hour++) {
            if (hour < 10) {
                hoursArray.push(`0${hour}:00`);
                hoursArray.push(`0${hour}:30`);
            } else {
                hoursArray.push(`${hour}:00`);
                hoursArray.push(`${hour}:30`);
            }
        }
        return hoursArray;
    }

    public async nextAvailableAppointment(selDate: string, selAssessor: string, selBranch: string): Promise<NextAvailable> {
        if (selDate === "") {
            selDate = moment().format("YYYY-MM-DD");
        }
        let availableHours: string[] = [];
        do {
            availableHours = await this.getAvailableHours(selDate, selAssessor, selBranch);
            selDate = moment(selDate, "YYYY-MM-DD").add(1, "days").format("YYYY-MM-DD");
        } while (availableHours.length === 0);
        return {
            nextAvailableTime: availableHours[0],
            nextAvailableDate: selDate
        };
    }
}