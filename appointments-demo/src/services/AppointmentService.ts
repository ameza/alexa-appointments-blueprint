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

    private async findAppointmentsByDate(date: string, assessor: string): Promise<Array<Appointment>> {
        return await  this.appointmentRepository.findAppointmentsByDate(date, assessor);
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
                            // if everything is possible then check for availability
                           availability = await this.checkAppointmentAvailability(request, availability);
                        }
                    }
                }
            }
        }

        return availability;
    }

    private async checkAppointmentAvailability(request: AppointmentRequest, availability: AvailabilityResponse): Promise<AvailabilityResponse>  {
        // TODO: check in db if available if not suggest alternatives
        availability.proceedBooking = true;
       const availableHours = await this.getAvailableHours(request);

        // check if date is fully booked (get day and count hours from opening to close until not finding)
        if (availableHours.length === 0) {
            availability.proceedBooking = false;
            availability.elementToFix =  {
                name: "SEL_DATE",
                reason: "",
                valid: true
            };
            availability.message = `Unfortunately this date is fully booked with ${request.selAssessor}`;
        } else if (availableHours.indexOf(request.selTime) < -1) {
            availability.proceedBooking = false;
            availability.elementToFix =  {
                name: "SEL_TIME",
                reason: "",
                valid: true
            };
            availability.message = `Unfortunately this time is already booked with ${request.selAssessor}`;
        }
        // check if time is available

        return availability;
    }

    private suggestChangeAlternatives(request: AppointmentRequest ) {
        // TODO: find out a way of suggesting alternatives
    }

    public async getAvailableHours(request: AppointmentRequest): Promise<string[]> {
        const possibleHours = this.generateArrayOfPossibleHours();
        const dateAppointments = await this.findAppointmentsByDate(request.selDate, request.selAssessor);
        const filteredHours = possibleHours.filter((possible) => dateAppointments.every((booked) => possible !== booked.date));
        return filteredHours;
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
}