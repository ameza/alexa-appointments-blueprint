import * as Alexa from "alexa-sdk";

import { DefaultHandlers } from "./handlers/";
// import {AppointmentsController, AssessorController, BranchController, BuiltInController} from "./controllers";
// import {ProcedureController} from "./controllers/ProcedureController";


const handler = function(event: Alexa.RequestBody<Alexa.Request>, context: Alexa.Context, callback: (err: any, response: any) => void): void {


    context.callbackWaitsForEmptyEventLoop = false;
    const alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers(DefaultHandlers);
    alexa.execute();
};

export default handler;


/*{
        "BookAppointmentIntent": function() {
        new AppointmentsController(this).bookIntent();
    },
        "ServiceListingIntent": function() {
        new ProcedureController(this).procedureListingIntent();
    },
        "BranchListingIntent": function() {
        new BranchController(this).branchListingIntent();
    },
        "AssessorListingIntent": function() {
        new AssessorController(this).assessorListingIntent();
    },
        "NextAvailableDateIntent": function() {
        new BuiltInController(this).notdefinedIntent();
    },
        "LaunchRequest": function() {
        new BuiltInController(this).launchIntent();
    },
        "SessionEndedRequest": function() {
        new BuiltInController(this).notdefinedIntent();
    },
        "AMAZON.CancelIntent": function() {
        new BuiltInController(this).cancelIntent();
    },
        "AMAZON.HelpIntent": function() {
        new BuiltInController(this).helpIntent();
    },
        "AMAZON.StopIntent": function() {
        new BuiltInController(this).stopIntent();
    },
        "AMAZON.FallbackIntent": function() {
        new BuiltInController(this).fallBackIntent();
    },
        "Unhandled": function() {
        new BuiltInController(this).helpIntent();
    }
    }*/