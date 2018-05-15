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

// assessor

