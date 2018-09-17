import * as Alexa from "alexa-sdk";
import * as moment  from "moment";
import { SessionHelper } from "../helpers";
import { AlexaResponse } from "../models";
import { AppointmentRequest, ElementRules, RuleCheckResult} from "../models/dto";
import { DateRepository } from "../repositories";
import { TimeService } from "./TimeService";

export class DateService {
    timeService: TimeService;
    dateRepository: DateRepository;
    handler: Alexa.Handler<Alexa.Request>;

    constructor(handler: Alexa.Handler<Alexa.Request>) {
        this.handler = handler;
        this.dateRepository = new DateRepository();
        this.timeService = new TimeService(handler);
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

        const currentAssessor = SessionHelper.getMatchedSlotValue(this.handler, intentObj.name, "SEL_ASSESSOR").realValue;
        const currentBranch = SessionHelper.getMatchedSlotValue(this.handler, intentObj.name, "SEL_BRANCH").realValue;

        const nextAvailableAppointment = await this.timeService.nextAvailableAppointment(undefined, currentAssessor, currentBranch);

        const invalidSpeech = (indicatePreviousMatchInvalid) ? (previousMatchInvalidMessage === "") ? `I'm sorry, I couldn't find that date. You must provide an specific date` : previousMatchInvalidMessage : ``;
        // TODO: add randomize to question
        const questionSpeech =  "On what date would you like to book?";
        const listAllSpeech = `The next date with an available appointment is ${nextAvailableAppointment.nextAvailableDate}.`;
        const repromptSpeech = `${invalidSpeech} ${(listAllItems) ? listAllSpeech : "" }  ${questionSpeech}`;
        const elicit: AlexaResponse = <AlexaResponse>{
            slotToElicit: "SEL_DATE",
            repromptSpeech: repromptSpeech,
            speechOutput: (listAllItems || indicatePreviousMatchInvalid) ? repromptSpeech : `${questionSpeech}`,
            cardContent: `${listAllSpeech}`,
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
                await this.handleDateSlotConfirmation(intentObj);
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
        const dateRules: ElementRules = {
            name: "SEL_DATE",
            reason: "",
            valid: true
        };
        if (request.selDate !== "N/A") {
            // check SEL_DATE possible in SEL_BRANCH
            // check SEL_DATE possible in SEL_SERVICE
            // check SEL_DATE possible in SEL_ASSESSOR
            // check SEL_DATE possible in SEL_TIME
            const datePossibleInBranch =  this.checkDatePossibleInBranch(request);
            if (!datePossibleInBranch.valid) {
                dateRules.reason = datePossibleInBranch.message;
                dateRules.valid = false;
            } else {
                const datePossibleInService = this.checkDatePossibleInService(request);
                if (!datePossibleInService.valid) {
                    dateRules.reason = datePossibleInService.message;
                    dateRules.valid = false;
                } else {
                    const datePossibleInAssessor = this.checkDatePossibleInAssessor(request);
                    if (!datePossibleInAssessor.valid) {
                        dateRules.reason = datePossibleInAssessor.message;
                        dateRules.valid = false;
                    } else {
                        const datePossibleInTime = this.checkDatePossibleInTime(request);
                        if (!datePossibleInTime.valid) {
                            dateRules.reason =  datePossibleInTime.message;
                            dateRules.valid = false;
                        }
                    }
                }
            }
        }
        return dateRules;
    }

    // custom rules can be added in the following methods, based on db calls

    private checkDatePossibleInBranch(request: AppointmentRequest): RuleCheckResult {

        const check: RuleCheckResult = { valid: true, message: ""};
        // TODO: get real business dates

        // monday to friday rule for all branches
        const format = "YYYY-MM-DD";
        let date = moment(request.selDate, format);

        // future date rule

        let now = moment(new Date());
        console.info(`about to compare dates before ${now} and selected ${date}`);
        if (date.isBefore(now, "day")) {
            check.message = `booking at a previous date is not allowed, my current date is: ${now.format(`${format} hh:mm`)},`;
            check.valid = false;
        }


        // monday to friday rule for all branches
        if (date.isoWeekday() === 6 || date.isoWeekday() === 7) {
            check.message = `${request.selBranch} is not open on weekends. ${request.selBranch} is Open from Monday to Friday.`;
            check.valid = false;
        }

        return check;

    }

    private checkDatePossibleInService(request: AppointmentRequest): RuleCheckResult {
        const check: RuleCheckResult = { valid: true, message: ""};

        // TODO: get real service dates
        if (!true) {
            check.message = `${request.selService} is not provided on ${request.selDate}. Service is provided at noon only.`;
            check.valid = false;
        }

        return check;

    }

    private checkDatePossibleInAssessor(request: AppointmentRequest): RuleCheckResult {
        const check: RuleCheckResult = { valid: true, message: ""};

        // meza rule only works on Mondays
        const format = "YYYY-MM-DD";
        let date = moment(request.selDate, format);
        // TODO: get real assessor dates
        const assessor = request.selAssessor;
        console.info(`assessor: ${assessor.toLowerCase()} index ${assessor.toLowerCase().indexOf("meza")} date: ${date.isoWeekday()}`);
        if (assessor.toLowerCase().indexOf("meza") > -1 && date.isoWeekday() === 1) {
            check.message = `${request.selAssessor} is not available on Mondays. ${request.selAssessor} is available from Tuesday to Wednesday.`;
            check.valid = false;
        }

        return check;
    }

    private checkDatePossibleInTime(request: AppointmentRequest): RuleCheckResult {
        const check: RuleCheckResult = { valid: true, message: ""};

        // TODO: get real date hours
        if (!true) {
            check.message = `${request.selTime} is not available on ${request.selDate}. Attention hours for ${request.selDate} go from 08:00 to 12:00.`;
            check.valid = false;
        }

        return check;
    }
}