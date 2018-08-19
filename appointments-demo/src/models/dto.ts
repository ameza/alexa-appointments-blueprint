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

// elicit

export interface Elicit  {
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

