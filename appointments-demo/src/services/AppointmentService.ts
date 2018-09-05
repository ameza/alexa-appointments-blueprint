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
            const procedureAvailability = this.procedureService.checkProcedureRules(request);
            if (!procedureAvailability.valid) {
                availability.elementToFix = procedureAvailability;
                availability.message = procedureAvailability.reason;
                availability.proceedBooking = false;
            }
            else {
                const assessorAvailability = this.assessorService.checkAssessorRules(request);
                if (!assessorAvailability.valid) {
                    availability.elementToFix = assessorAvailability ;
                    availability.message = procedureAvailability.reason;
                    availability.proceedBooking = false;
                }
                else {
                    const dateAvailability = this.dateService.checkDateRules(request);
                    if (!dateAvailability.valid) {
                        availability.elementToFix = dateAvailability;
                        availability.message = procedureAvailability.reason;
                        availability.proceedBooking = false;
                    }
                    else {
                        const procedureAvailability = this.timeService.checkTimeRules(request);
                        if (!procedureAvailability.valid) {
                            availability.elementToFix = procedureAvailability;
                            availability.message = procedureAvailability.reason;
                            availability.proceedBooking = false;
                        }
                        else {
                            // if everything is possible then check for availability
                           availability = this.checkAppointmentAvailability(request, availability);
                        }
                    }
                }
            }
        }

        return availability;
    }

    private checkAppointmentAvailability(request: AppointmentRequest, availability: AvailabilityResponse): AvailabilityResponse  {
        // TODO: check in db if available if not suggest alternatives
        // check if date is fully booked (get day and count hours from opening to close until not finding)
        // check if time is available
        availability.proceedBooking = true;
        return availability;
    }

    private suggestChangeAlternatives(request: AppointmentRequest ) {
        // TODO: find out a way of suggesting alternatives
    }
}