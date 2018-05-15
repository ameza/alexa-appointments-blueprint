import * as Alexa from "alexa-sdk";
import { configInstance } from "../config";


export const fakeDialogState = (request: Alexa.IntentRequest) => {
    if (!configInstance.isProduction) {
        request.dialogState = "COMPLETED";
    }
    return request;
};
