import * as Alexa from "alexa-sdk";

import { DefaultHandlers } from "./handlers/";


const handler = function(event: Alexa.RequestBody<Alexa.Request>, context: Alexa.Context, callback: (err: any, response: any) => void): void {


    context.callbackWaitsForEmptyEventLoop = false;
    const alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers(DefaultHandlers);
    alexa.execute();
};

export default handler;