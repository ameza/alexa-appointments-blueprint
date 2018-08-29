import * as Alexa from "alexa-sdk";
import { AppointmentsController, BranchController, BuiltInController } from "../controllers";

export const DefaultHandlers = Alexa.CreateStateHandler("", {
    BookAppointmentIntent() {
        new AppointmentsController(this).bookIntent();
    },
    ServiceListingIntent() {
        new BuiltInController(this).notdefinedIntent();
    },
    BranchListingIntent() {
        new BranchController(this).branchListingIntent();
    },
    AssessorListingIntent() {
        new BuiltInController(this).notdefinedIntent();
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
    Unhandled() {

        console.info("empty unhandled");
        this.emit("AMAZON.HelpIntent");
    }

});