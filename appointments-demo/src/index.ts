import * as Alexa from "alexa-sdk";

import AppointmentsController from "./controllers/AppointmentsController";
import BuiltInController from "./controllers/BuiltInController";

const handler = function(event: Alexa.RequestBody<Alexa.Request>, context: Alexa.Context, callback: (err: any, response: any) => void): void {


    context.callbackWaitsForEmptyEventLoop = false;
    const alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers({
        "LaunchRequest": function() { new AppointmentsController(this).launch(); },
        "BookAppointmentInt": function() { new AppointmentsController(this).book(); },
        "ServiceListingIntent": function() { new AppointmentsController(this).nodefined(); },
        "BranchListingIntent": function() { new AppointmentsController(this).nodefined(); },
        "AssessorListingIntent": function() { new AppointmentsController(this).nodefined(); },
        "NextAvailableDateIntent": function() { new AppointmentsController(this).nodefined(); },
        "SessionEndedRequest" : function() { new AppointmentsController(this).nodefined(); },
        "AMAZON.CancelIntent": function () { new BuiltInController(this).cancel(); },
        "AMAZON.HelpIntent": function () { new BuiltInController(this).help(); },
        "AMAZON.StopIntent": function () { new BuiltInController(this).stop(); },
        "AMAZON.FallbackIntent": function () { new BuiltInController(this).fallBack(); }
        });
    alexa.execute();
};

export default handler;