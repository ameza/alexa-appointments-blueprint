import {ConfirmationStatuses, Resolutions, SlotValue} from "alexa-sdk";

export interface WorldlyHelloRequest {
    language: string;
}

// appointments

export interface AppointmentRequest {
    selBranch: string;
    selService: string;
    selAssessor: string;
    selTime: string;
    selDate: string;
}

export interface AppointmentResponse {
    text: string;
    ssml: string;
}

export interface WorldlyHelloResponse {
    text: string;
    ssml: string;
}

export interface ElementRules {
    name: string;
    valid: boolean;
    reason: string;
}

export interface AvailabilityResponse {
    elementToFix: ElementRules;
    message: string;
    proceedBooking: boolean;
}

export interface RuleCheckResult {
    valid: boolean;
    message: string;
}
// elicit

export interface AlexaResponse  {
    branches: string;
    slotToElicit: string;
    speechOutput: string;
    repromptSpeech: string;
    cardContent: string;
    cardTitle: string;
    updatedIntent: any;
    imageObj: {
        smallImageUrl: string;
        largeImageUrl: string;
    };
}

export class MatchedSlot implements SlotValue {
    successMatch: boolean;
    realValue: string;
    confirmationStatus: ConfirmationStatuses;
    name: string;
    resolutions: Resolutions;
    value: any;
}
