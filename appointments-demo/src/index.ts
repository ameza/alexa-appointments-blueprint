import * as Alexa from "alexa-sdk";
import { AppointmentsController, BranchController, BuiltInController } from "./controllers";

const handler = function(event: Alexa.RequestBody<Alexa.Request>, context: Alexa.Context, callback: (err: any, response: any) => void): void {


    context.callbackWaitsForEmptyEventLoop = false;
    const alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers({
        "LaunchRequest": function() { new BuiltInController(this).launchIntent(); },
        "BookAppointmentInt": function() { new AppointmentsController(this).bookIntent(); },
        "ServiceListingIntent": function() { new BuiltInController(this).notdefinedIntent(); },
        "BranchListingIntent": function() { new BranchController(this).branchListingIntent(); },
        "AssessorListingIntent": function() { new BuiltInController(this).notdefinedIntent(); },
        "NextAvailableDateIntent": function() { new BuiltInController(this).notdefinedIntent(); },
        "SessionEndedRequest" : function() { new BuiltInController(this).notdefinedIntent(); },
        "AMAZON.CancelIntent": function () { new BuiltInController(this).cancelIntent(); },
        "AMAZON.HelpIntent": function () { new BuiltInController(this).helpIntent(); },
        "AMAZON.StopIntent": function () { new BuiltInController(this).stopIntent(); },
        "AMAZON.FallbackIntent": function () { new BuiltInController(this).fallBackIntent(); }
        });
    alexa.execute();
};

export default handler;