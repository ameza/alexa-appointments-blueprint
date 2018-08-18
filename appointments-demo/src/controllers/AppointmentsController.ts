import * as Alexa from "alexa-sdk";

import * as moment  from "moment";
import { fakeDialogState } from "../helpers/RequestHelpers";
import { AppointmentRequest, Assessor, Branch, Configuration, Service } from "../models";
import { IntentController } from "./IntentController";

import { AppointmentService, AssessorService, BranchService, ConfigurationService, DateService, ProcedureService, TimeService } from "../services";



interface Elicit  {
    branches: string;
    slotToElicit: string;
    speechOutput: string;
    repromptSpeech: string;
    cardContent: string;
    cardTitle: string;
    updatedIntent: any;
    imageObj: {
        smallImageUrl: string;
        largeImageUrl: string;
    };
}

class AppointmentsController extends IntentController {

    appointmentService: AppointmentService;
    assessorService: AssessorService;
    procedureService: ProcedureService;
    branchService: BranchService;
    configurationService: ConfigurationService;
    dateService: DateService;
    timeService: TimeService;

    constructor(handler: Alexa.Handler<Alexa.Request>) {
        super(handler);
        this.appointmentService = new AppointmentService();
        this.assessorService = new AssessorService();
        this.procedureService = new ProcedureService();
        this.branchService = new BranchService();
        this.configurationService = new ConfigurationService();
        this.dateService = new DateService();
        this.timeService = new TimeService();

    }

    // INTENT

    handleBookIntentConfirmed(intentObj: Alexa.Intent): void {
        console.log("in completed");

        const appointmentRequest: AppointmentRequest = {
            selBranch: intentObj.slots.SEL_BRANCH.resolutions.resolutionsPerAuthority[0].values[0].value.name,
            selAssessor: intentObj.slots.SEL_ASSESSOR.resolutions.resolutionsPerAuthority[0].values[0].value.name,
            selService: intentObj.slots.SEL_SERVICE.resolutions.resolutionsPerAuthority[0].values[0].value.name,
            selDate: intentObj.slots.SEL_DATE.value,
            selTime: intentObj.slots.SEL_TIME.value
        };
        // Dialog is now complete and all required slots should be filled,
        // so call your normal intent handler.
        this.appointmentService.book(appointmentRequest).then((response) => {

            let ssml = response.ssml;
            // We need to clean the <speak> tags because
            // alexa-sdk adds them
            ssml = ssml.replace("<speak>", "");
            ssml = ssml.replace("</speak>", "");

            this.handler.emit(":tellWithCard", ssml, ssml, "Booked!!");
        }).catch((error) => {
            console.error(error);
            this.handler.emit(":tell", "Error on appointment service" + error);
        });
    }

    async handleBookIntentDenial(intentObj: Alexa.Intent): Promise<void> {

        // avoid offering unavailable options
        const config = await this.getModelConfiguration();
        const assessorText = (config.assessorConfig === "G" || config.assessorConfig === "N") ? "" : `Assessor`;
        const dateText = (config.dateConfig === "G" || config.dateConfig === "N") ? "" : `Date`;
        const timeText = (config.timeConfig === "G" || config.timeConfig === "N") ? "" : `Time`;
        console.info(`pregunto con ${intentObj.slots.TO_FIX.value}`);
        const elicit: Elicit = <Elicit>{
            slotToElicit: "TO_FIX",
            speechOutput: `What part of the appointment would you like to change: Location, ${timeText}, ${assessorText}, ${dateText} or Service ? You can also say cancel to discard the appointment`,
            cardContent: `Location, Service, Consultant, Date or time`,
            cardTitle: "Available Offices",
            updatedIntent: intentObj,
            /* imageObj: {
                 smallImageUrl: "https://imgs.xkcd.com/comics/standards.png",
                 largeImageUrl: "https://imgs.xkcd.com/comics/standards.png"
             }*/
        };

        this.handler.emit(":elicitSlotWithCard", elicit.slotToElicit, elicit.speechOutput, elicit.speechOutput, elicit.cardTitle, elicit.cardContent, elicit.updatedIntent, elicit.imageObj);

    }

    handleBookIntentConfirmation(intentObj: Alexa.Intent): void {
        if (intentObj.confirmationStatus !== "CONFIRMED") {
            if (intentObj.confirmationStatus !== "DENIED") {
                // Intent is not confirmed

                const assessorText = (intentObj.slots.SEL_ASSESSOR.value === "N/A") ? "" : `with ${intentObj.slots.SEL_ASSESSOR.value}`;
                const dateText = (intentObj.slots.SEL_DATE.value === "N/A") ? "" : `for ${intentObj.slots.SEL_DATE.value}`;
                const timeText = (intentObj.slots.SEL_TIME.value === "N/A") ? "" : `at ${intentObj.slots.SEL_TIME.value} hours`;

                const message = `You want to book an ${intentObj.slots.SEL_SERVICE.value} appointment ${assessorText} ${dateText} ${timeText} on the ${intentObj.slots.SEL_BRANCH.value} office`;
                const speechOutput = `${message}, is that correct?`;
                const cardTitle = "Booking Summary";
                const repromptSpeech = speechOutput;
                const cardContent = speechOutput;
                console.info(`about to confirm ${intentObj.confirmationStatus} and ${intentObj.slots.TO_FIX.value}`);
                console.info(`slots before last confirm`);
                console.info(intentObj.slots);
                this.handler.emit(":confirmIntentWithCard", speechOutput, repromptSpeech, cardTitle, cardContent, intentObj);
            } else {
                // Users denies the confirmation of intent. May be value of the slots are not correct.
                console.info("handle denial");
                this.handleBookIntentDenial(intentObj);
            }
        } else {
            console.info("handle book intent confirmed");
            this.handleBookIntentConfirmed(intentObj);
        }
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
        const branches = await this.branchService.findAll();
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

    handleBranchMatch(intentObj: Alexa.Intent): void {
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
                this.branchElicit(intentObj, true, true);
            }
        }
        else {
            this.branchElicit(intentObj, false, false);
        }
    }

    // SERVICE

    getRecommendedServices(services: Array<Service>): string {
        const recommended = services.filter((x) => x.enabled && x.popular === true);
        if (recommended.length === 1) {
            return recommended.pop().value;
        }
        else {
            const last = recommended.pop();
            return `${recommended.map(x => {  return x.value; }).join(", ")} and ${last.value}`;
        }
    }

    getFullServices(services: Array<Service>): string {
        const all = services.filter((x) => x.enabled);
        return ` ${all.map( x => { return x.value; }).join("\r\n")}`;
    }

    handleServiceSlotConfirmation(intentObj: Alexa.Intent): void {
        if (intentObj.slots.SEL_SERVICE.confirmationStatus === "DENIED") {
            this.serviceElicit(intentObj, true, false);
        } else {
            // Slot value is not confirmed
            const slotToConfirm = "SEL_SERVICE";
            const speechOutput = `You want the ${intentObj.slots.SEL_SERVICE.value} service, is that correct?`;
            const repromptSpeech = speechOutput;
            this.handler.emit(":confirmSlot", slotToConfirm, speechOutput, repromptSpeech);
        }
    }

    async serviceElicit(intentObj: Alexa.Intent, goFull: boolean, invalid: boolean): Promise<void> {
        const services = await this.procedureService.findAll();
        const invalidSpeech = (invalid) ? `Unfortunately that's not a service I can identify.` : ``;
        const repromptSpeech = `${invalidSpeech} Our most popular services are: ${this.getRecommendedServices(services)}. I've sent the complete list of services to your Alexa App. What service would you like to book?`;
        console.info(repromptSpeech);
        const elicit: Elicit = <Elicit>{
            slotToElicit: "SEL_SERVICE",
            repromptSpeech: repromptSpeech,
            speechOutput: (goFull || invalid) ? repromptSpeech : "What service would you like to book?",
            cardContent: `${this.getFullServices(services)}`,
            cardTitle: "Available Services",
            updatedIntent: intentObj,
            /*  imageObj: {
                  smallImageUrl: "https://imgs.xkcd.com/comics/standards.png",
                  largeImageUrl: "https://imgs.xkcd.com/comics/standards.png"
              }*/
        };

        this.handler.emit(":elicitSlotWithCard", elicit.slotToElicit, elicit.speechOutput, elicit.repromptSpeech, elicit.cardTitle, elicit.cardContent, elicit.updatedIntent, elicit.imageObj);

    }

    handleServiceMatch(intentObj: Alexa.Intent): void {
        if (!!intentObj.slots.SEL_SERVICE.value) {
            if (intentObj.slots.SEL_SERVICE.resolutions &&
                intentObj.slots.SEL_SERVICE.resolutions.resolutionsPerAuthority &&
                intentObj.slots.SEL_SERVICE.resolutions.resolutionsPerAuthority[0] &&
                intentObj.slots.SEL_SERVICE.resolutions.resolutionsPerAuthority[0].status &&
                intentObj.slots.SEL_SERVICE.resolutions.resolutionsPerAuthority[0].status.code &&
                intentObj.slots.SEL_SERVICE.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH") {
                this.handleServiceSlotConfirmation(intentObj);
            }
            else {
                this.serviceElicit(intentObj, true, true);
            }
        }
        else {
            this.serviceElicit(intentObj, false, false);
        }
    }

    // DATE

    handleDateSlotConfirmation(intentObj: Alexa.Intent): void {
        if (intentObj.slots.SEL_DATE.confirmationStatus === "DENIED") {
            this.dateElicit(intentObj, true, false);
        } else {
            // Slot value is not confirmed
            const slotToConfirm = "SEL_DATE";
            const speechOutput = `You want to book on ${intentObj.slots.SEL_DATE.value}, is that correct?`;
            const repromptSpeech = speechOutput;
            this.handler.emit(":confirmSlot", slotToConfirm, speechOutput, repromptSpeech);
        }
    }

    dateElicit(intentObj: Alexa.Intent, goFull: boolean, invalid: boolean): void {
        const dates = "05/12/2018, 06/12/2018 and 07/12/2018";
        const invalidSpeech = (invalid) ? `I'm sorry, I couldn't find that date. You must provide an specific date` : ``;
        const repromptSpeech = `${invalidSpeech} I have some space on the following dates: ${dates}. I've sent a list of available dates to your Alexa App. What's your date preference for this appointment?,`;
        const elicit: Elicit = <Elicit>{
            slotToElicit: "SEL_DATE",
            repromptSpeech: repromptSpeech,
            speechOutput: (goFull || invalid) ? repromptSpeech : "On what date would you like to book?",
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

    handleDateMatch(intentObj: Alexa.Intent): void {
        if (!!intentObj.slots.SEL_DATE.value) {

            console.info(intentObj.slots.SEL_DATE.value);

            if (moment(intentObj.slots.SEL_DATE.value, "YYYY-MM-DD", true).isValid() === true) {
                console.info("confirm");
                this.handleDateSlotConfirmation(intentObj);
            }
            else {
                console.info("entro");
                this.dateElicit(intentObj, true, true);
            }
        }
        else {
            this.dateElicit(intentObj, false, false);
        }
    }

    // ASSESSOR

    getRecommendedAssessors(assessors: Array<Assessor>): string {
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

    handleAssessorSlotConfirmation(intentObj: Alexa.Intent): void {
        if (intentObj.slots.SEL_ASSESSOR.confirmationStatus === "DENIED") {
            this.assessorElicit(intentObj, true, false);
        } else {
            // Slot value is not confirmed
            const slotToConfirm = "SEL_ASSESSOR";
            const speechOutput = `You want to book with ${intentObj.slots.SEL_ASSESSOR.value}, is that correct?`;
            const repromptSpeech = speechOutput;
            this.handler.emit(":confirmSlot", slotToConfirm, speechOutput, repromptSpeech);
        }
    }

    async assessorElicit(intentObj: Alexa.Intent, goFull: boolean, invalid: boolean): Promise<void> {
        const assessors = await this.assessorService.findAll();
        const invalidSpeech = (invalid) ? `I'm sorry, I couldn't find that assessor.` : ``;
        const repromptSpeech = `${invalidSpeech} Currently we have the following assessors available: ${ this.getRecommendedAssessors(assessors)}. I've sent the complete list of assessors to your Alexa App. Who would you like to book with?`;
        const elicit: Elicit = <Elicit>{
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

    handleAssessorMatch(intentObj: Alexa.Intent): void {
        if (!!intentObj.slots.SEL_ASSESSOR.value) {
            if (intentObj.slots.SEL_ASSESSOR.resolutions &&
                intentObj.slots.SEL_ASSESSOR.resolutions.resolutionsPerAuthority &&
                intentObj.slots.SEL_ASSESSOR.resolutions.resolutionsPerAuthority[0] &&
                intentObj.slots.SEL_ASSESSOR.resolutions.resolutionsPerAuthority[0].status &&
                intentObj.slots.SEL_ASSESSOR.resolutions.resolutionsPerAuthority[0].status.code &&
                intentObj.slots.SEL_ASSESSOR.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH") {
                this.handleAssessorSlotConfirmation(intentObj);
            }
            else {
                this.assessorElicit(intentObj, true, true);
            }
        }
        else {
            this.assessorElicit(intentObj, false, false);
        }
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

    timeElicit(intentObj: Alexa.Intent, goFull: boolean, invalid: boolean): void {
        const times = "14:00, 14:30 and 15:00";
        const invalidSpeech = (invalid) ? `That doesn't look like a valid time` : ``;
        const repromptSpeech = `${invalidSpeech} Some available slots on this date are: ${times}. I've sent a list of available times for this day to your Alexa App. What is your time preference for this appointment,`;
        const elicit: Elicit = <Elicit>{
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

    handleTimeMatch(intentObj: Alexa.Intent): void {
        if (!!intentObj.slots.SEL_TIME.value) {
            console.info(intentObj.slots.SEL_TIME);
            if (moment(intentObj.slots.SEL_TIME.value, "hh:mm").isValid() === true) {
                console.info("time confirm");
                this.handleTimeSlotConfirmation(intentObj);
            }
            else {
                console.info("elicit 1");
                this.timeElicit(intentObj, true, true);
            }
        }
        else {
            console.info("elicit 2");
            this.timeElicit(intentObj, false, false);
        }
    }

    // HELPERS

    // Checks if the user requested a fix
    async checkFixAgainstConfiguration(intentObj: Alexa.Intent): Promise<void> {
        let id = "";
        if (intentObj.slots.TO_FIX.resolutions &&
            intentObj.slots.TO_FIX.resolutions.resolutionsPerAuthority &&
            intentObj.slots.TO_FIX.resolutions.resolutionsPerAuthority[0] &&
            intentObj.slots.TO_FIX.resolutions.resolutionsPerAuthority[0].values &&
            intentObj.slots.TO_FIX.resolutions.resolutionsPerAuthority[0].values[0] &&
            intentObj.slots.TO_FIX.resolutions.resolutionsPerAuthority[0].values[0].value &&
            intentObj.slots.TO_FIX.resolutions.resolutionsPerAuthority[0].values[0].value.id) {

            id = intentObj.slots.TO_FIX.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        } else if (intentObj.slots.TO_FIX.value) {
            id = intentObj.slots.TO_FIX.value;
        }
        console.info(`id is: ${id}`);
        if (!!id) {
            console.info(`id is valid about to clean TO_FIX: ${id}`);
            intentObj.slots.TO_FIX.value = undefined;
            intentObj.slots.TO_FIX.resolutions = undefined;
            console.info(`intent status is ${intentObj.confirmationStatus} let's verify if valid fix`);

            // check if this is a valid fix, only selectable are subject to fix

            const config = await this.getModelConfiguration();
            switch (id) {
                case "Time":
                    if (config.timeConfig === "S") {
                        if (intentObj.confirmationStatus !== "CONFIRMED") {
                            intentObj.confirmationStatus = "NONE";
                            intentObj.slots.SEL_TIME.confirmationStatus = "NONE";
                            intentObj.slots.SEL_TIME.value = undefined;
                        }
                    }
                    break;
                case "Date":
                    if (config.dateConfig === "S") {
                        if (intentObj.confirmationStatus !== "CONFIRMED") {
                            intentObj.confirmationStatus = "NONE";
                            intentObj.slots.SEL_DATE.confirmationStatus = "NONE";
                            intentObj.slots.SEL_DATE.value = undefined;
                        }
                    }
                    break;
                case "Assessor":
                    if (config.assessorConfig === "S") {
                        if (intentObj.confirmationStatus !== "CONFIRMED") {
                            intentObj.confirmationStatus = "NONE";
                            intentObj.slots.SEL_ASSESSOR.confirmationStatus = "NONE";
                            intentObj.slots.SEL_ASSESSOR.value = undefined;
                        }
                    }
                    break;
                case "Service":
                    if (intentObj.confirmationStatus !== "CONFIRMED") {
                        intentObj.confirmationStatus = "NONE";
                        intentObj.slots.SEL_SERVICE.confirmationStatus = "NONE";
                        intentObj.slots.SEL_SERVICE.value = undefined;
                        intentObj.slots.SEL_SERVICE.resolutions = undefined;
                        await this.serviceElicit(intentObj, true, false);
                    }
                    break;
                case "Branch":
                    if (intentObj.confirmationStatus !== "CONFIRMED") {
                        intentObj.confirmationStatus = "NONE";
                        intentObj.slots.SEL_BRANCH.confirmationStatus = "NONE";
                        intentObj.slots.SEL_BRANCH.value = undefined;
                        intentObj.slots.SEL_BRANCH.resolutions = undefined;
                        await this.branchElicit(intentObj, true, false);
                    }
                    break;
                default:
                    console.info("default from check clean");
                    await this.handleBookIntentDenial(intentObj);
            }
        }
    }

    // Allows to confirm matched fields without confirmation
    async clusterFirstSlots(intentReq: Alexa.IntentRequest): Promise<void> {

        const intentObj = intentReq.intent;

        if (intentReq.intent.confirmationStatus !== "DENIED" && (intentReq.dialogState === "STARTED" || intentReq.dialogState === undefined) && !this.handler.attributes["temp_" + intentReq.intent.name]) {
            console.info("Starting Clustering");
            // we check only the main fields
            const slotsToCheck = ["SEL_BRANCH", "SEL_SERVICE", "SEL_ASSESSOR", "SEL_DATE", "SEL_TIME"];
            const toConfirm = [];
            let count = 0;
            slotsToCheck.forEach((item) => {
                // check if slot has value but no confirmation
                console.info(`Checking Slot ${item}`);
                if (intentObj.slots[item].value !== undefined && (intentObj.slots[item].confirmationStatus === "NONE" || intentObj.slots[item].confirmationStatus === undefined) ) {
                    let checkMatch: boolean = false;
                    // check if slot is a proper match
                    if (intentObj.slots[item].resolutions) {
                        console.info(`Slot ${item} has resolutions`);
                        checkMatch = intentObj.slots[item].resolutions.resolutionsPerAuthority.some((res) => {
                            return res.status.code === "ER_SUCCESS_MATCH";
                        });
                    }
                    // if match text or date/time, save for further confirmation
                    if (checkMatch || item === "SEL_DATE" || item === "SEL_TIME") {
                        count++;
                        console.info(`Increasing count for item: ${item}`);
                        toConfirm.push(item);
                    }
                }
            });
            // this means the user provided a bunch of slots and they match, we should confirm them if more than one
            if (count > 1) {
                toConfirm.forEach((item) => {
                    console.info(`Marking ${item} as confirmed`);
                    intentObj.slots[item].confirmationStatus = "CONFIRMED";
                });
            }
        }
    }

    // reads the model config from the db and populate defaults
    async assignConfigurationDefaults(intentObj: Alexa.Intent): Promise<void> {
        const config = await this.getModelConfiguration();

        if (intentObj.slots.SEL_ASSESSOR.confirmationStatus !== "CONFIRMED") {
            switch (config.assessorConfig) {
                case "G":

                    const randAssessor = await this.assessorService.findRandom();

                    intentObj.slots.SEL_ASSESSOR.value = randAssessor.value;
                    intentObj.slots.SEL_ASSESSOR.confirmationStatus = "CONFIRMED";


                    break;

                case "N":
                    intentObj.slots.SEL_ASSESSOR.value = "N/A";
                    intentObj.slots.SEL_ASSESSOR.confirmationStatus = "CONFIRMED";
                    break;
                default:
            }
        }

        if (intentObj.slots.SEL_DATE.confirmationStatus !== "CONFIRMED") {
            switch (config.dateConfig) {
                case "G":

                    const randDate = await this.dateService.findRandom();

                    intentObj.slots.SEL_DATE.value = randDate;
                    intentObj.slots.SEL_DATE.confirmationStatus = "CONFIRMED";
                    break;

                case "N":
                    intentObj.slots.SEL_DATE.value = "N/A";
                    intentObj.slots.SEL_DATE.confirmationStatus = "CONFIRMED";
                    break;
                default:
            }
        }

        if (intentObj.slots.SEL_TIME.confirmationStatus !== "CONFIRMED") {
            switch (config.timeConfig) {
                case "G":

                    const randTime = await this.timeService.findRandom();

                    intentObj.slots.SEL_TIME.value = randTime;
                    intentObj.slots.SEL_TIME.confirmationStatus = "CONFIRMED";

                    break;

                case "N":
                    intentObj.slots.SEL_TIME.value = "N/A";
                    intentObj.slots.SEL_TIME.confirmationStatus = "CONFIRMED";

                    break;
                default:
            }
        }
    }

    // retrieves the model config from the db
    async getModelConfiguration(): Promise<Configuration> {
        return await this.configurationService.findOne();
    }

    // restores the appointment intent from session in case of an interruption
    async restoreIntentSession(intentReq: Alexa.IntentRequest): Promise<void> {

        console.info("State: " + intentReq.dialogState);
        // We only need to restore state if all the slots are unconfirmed
        if (intentReq.dialogState === "STARTED" && this.handler.attributes["temp_" + intentReq.intent.name]) {
            console.info("Starting Recovery");
            let tempSlots = this.handler.attributes["temp_" + intentReq.intent.name].slots;

            Object.keys(tempSlots).forEach(currentSlot => {
                if (tempSlots[currentSlot].value) {
                    intentReq.intent.slots[currentSlot] = tempSlots[currentSlot];
                    intentReq.intent.slots[currentSlot].confirmationStatus = tempSlots[currentSlot].confirmationStatus;
                }
            }, this);
            console.info("Done Recovery");
            console.info(intentReq.intent.slots);
        }

        console.info("Starting Save");
        this.handler.attributes["temp_" + intentReq.intent.name] = intentReq.intent;
        console.info("Done Save");
        console.info(intentReq.intent.slots);

    }

    // INTENT BODY

    async book(): Promise<void> {

        const request: Alexa.IntentRequest = this.handler.event.request; // = fakeDialogState(this.handler.event.request);
        const intentObj = request.intent;

        console.info(`virgin request`)
        console.info(request.intent.slots);

        await this.clusterFirstSlots(request);

        console.info(`request after cluster`);
        console.info(request.intent.slots);

        await this.restoreIntentSession(request);

        console.info(`request after restore`);
        console.info(request.intent.slots);

        await this.checkFixAgainstConfiguration(intentObj);

        console.info(`request after fix config`);
        console.info(request.intent.slots);

        await this.assignConfigurationDefaults(intentObj);

        console.info(`request assign config defaults`);
        console.info(request.intent.slots);

        if (intentObj.slots.SEL_BRANCH.confirmationStatus !== "CONFIRMED") {
            this.handleBranchMatch(intentObj);
        } else if (intentObj.slots.SEL_SERVICE.confirmationStatus !== "CONFIRMED") {
            this.handleServiceMatch(intentObj);
        } else if (intentObj.slots.SEL_ASSESSOR.confirmationStatus !== "CONFIRMED") {
            this.handleAssessorMatch(intentObj);
        } else if (intentObj.slots.SEL_DATE.confirmationStatus !== "CONFIRMED") {
            this.handleDateMatch(intentObj);
        } else if (intentObj.slots.SEL_TIME.confirmationStatus !== "CONFIRMED") {
            this.handleTimeMatch(intentObj);
        } else {
            request.dialogState = "COMPLETED";
            this.handleBookIntentConfirmation(intentObj);
        }
    }

    launch(): void {
        const speech = "Welcome to Dental Office, this skill allows you to book appointments in our dental offices, start by saying book an appointment";
        this.handler.emit(":ask", speech, speech);
    }

    nodefined(): void {
        const speech = "bad request";
        this.handler.emit(":ask", speech, speech);
    }
}

export default AppointmentsController;