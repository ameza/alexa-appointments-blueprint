import * as Alexa from "alexa-sdk";
import { Appointment } from "../models";
import { AppointmentRequest, AppointmentResponse, AvailabilityResponse, ElementRules} from "../models/dto";
import { AppointmentRepository } from "../repositories";
import {
    AssessorService,
    BranchService,
    ConfigurationService,
    DateService,
    ProcedureService,
    TimeService
} from "./index";

export class AppointmentService {

    assessorService: AssessorService;
    procedureService: ProcedureService;
    branchService: BranchService;
    configurationService: ConfigurationService;
    dateService: DateService;
    timeService: TimeService;
    appointmentRepository: AppointmentRepository;
    handler: Alexa.Handler<Alexa.Request>;

    constructor(handler: Alexa.Handler<Alexa.Request>) {
        this.handler = handler;
        this.appointmentRepository = new AppointmentRepository();
        this.assessorService = new AssessorService(handler);
        this.procedureService = new ProcedureService(handler);
        this.branchService = new BranchService(handler);
        this.configurationService = new ConfigurationService();
        this.dateService = new DateService(handler);
        this.timeService = new TimeService(handler);
    }
    public async create(request): Promise<Appointment> {
       return  await this.appointmentRepository.create(request);
    }

    public async checkAppointmentRules(request: AppointmentRequest): Promise<AvailabilityResponse> {
        let availability: AvailabilityResponse = { elementToFix: undefined, message: "", proceedBooking: true };

        // check each element for Viability
        const branchRules = this.branchService.checkBranchRules(request);
        if (!branchRules.valid) {
            availability.elementToFix = branchRules;
            availability.message = branchRules.reason;
            availability.proceedBooking = false;
        }
        else {
            const procedureRules = this.procedureService.checkProcedureRules(request);
            if (!procedureRules.valid) {
                availability.elementToFix = procedureRules;
                availability.message = procedureRules.reason;
                availability.proceedBooking = false;
            }
            else {
                const assessorRules = this.assessorService.checkAssessorRules(request);
                if (!assessorRules.valid) {
                    availability.elementToFix = assessorRules ;
                    availability.message = assessorRules.reason;
                    availability.proceedBooking = false;
                }
                else {
                    const dateRules = this.dateService.checkDateRules(request);
                    if (!dateRules.valid) {
                        availability.elementToFix = dateRules;
                        availability.message = dateRules.reason;
                        availability.proceedBooking = false;
                    }
                    else {
                        const timeRules = this.timeService.checkTimeRules(request);
                        if (!timeRules.valid) {
                            availability.elementToFix = timeRules;
                            availability.message = timeRules.reason;
                            availability.proceedBooking = false;
                        }
                        else {
                            console.info(`about to check final availability`);
                            // if everything is possible then check for availability
                           availability = await this.checkAppointmentAvailability(request, availability);
                           console.info(`availability final result`);
                           console.info(availability);
                        }
                    }
                }
            }
        }

        return availability;
    }

    public async checkAppointmentAvailability(request: AppointmentRequest, availability: AvailabilityResponse): Promise<AvailabilityResponse>  {
        // TODO: check in db if available if not suggest alternatives
        availability.proceedBooking = true;
       const availableHours = await this.timeService.getAvailableHours(request.selDate, request.selAssessor, request.selBranch);
        console.info(`about to check rules for time: ${request.selTime} assessor: ${request.selAssessor}`);
        // check if date is fully booked (get day and count hours from opening to close until not finding)
        if (availableHours.length === 0) {
            availability.proceedBooking = false;
            availability.elementToFix =  {
                name: "SEL_DATE",
                reason: "",
                valid: true
            };
            availability.message = `Unfortunately this date is fully booked with ${request.selAssessor}, try another date or Doctor`;
        } else if (availableHours.indexOf(request.selTime) <= -1 && request.selTime !== "N/A") {
            console.info(`time ${request.selTime} found in available hours`);
            availability.proceedBooking = false;
            availability.elementToFix =  {
                name: "SEL_TIME",
                reason: "",
                valid: true
            };
            availability.message = `Unfortunately this time is already booked with ${request.selAssessor}, try another time.`;
        }
        // check if time is available

        return availability;
    }


}