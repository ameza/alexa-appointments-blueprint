import * as Alexa from "alexa-sdk";
import {AppointmentsController, AssessorController, BranchController, BuiltInController} from "../controllers";
import {ProcedureController} from "../controllers/ProcedureController";

export const DefaultHandlers = Alexa.CreateStateHandler("", {
    BookAppointmentIntent() {
        new AppointmentsController(this).bookIntent();
    },
    ServiceListingIntent() {
        new ProcedureController(this).procedureListingIntent();
    },
    BranchListingIntent() {
        new BranchController(this).branchListingIntent();
    },
    AssessorListingIntent() {
        new AssessorController(this).assessorListingIntent();
    },
    NextAvailableDateIntent() {
        new BuiltInController(this).notdefinedIntent();
    },
    LaunchRequest() {
        new BuiltInController(this).launchIntent();
    },
    SessionEndedRequest() {
        new BuiltInController(this).notdefinedIntent();
    },
    "AMAZON.CancelIntent"() {
        new BuiltInController(this).cancelIntent();
    },
    "AMAZON.HelpIntent"() {
        new BuiltInController(this).helpIntent();
    },
    "AMAZON.StopIntent"() {
        new BuiltInController(this).stopIntent();
    },
    "AMAZON.FallbackIntent"() {
        new BuiltInController(this).fallBackIntent();
    },
    "Unhandled"() {
        new BuiltInController(this).helpIntent();
    }

});