import "isomorphic-fetch";

import {
    WorldlyHelloRequest,
    WorldlyHelloResponse
} from "../models/dto";



namespace WorldlyHello {
    export function getHello(request: WorldlyHelloRequest): Promise<WorldlyHelloResponse> {
        return new Promise((resolve, reject) => {
            const language = request.language.toLowerCase();
            const response = "jaja";

            if (response) {
                resolve({
                    text: "hi",
                    ssml: "bye"
                });
            } else {
                reject(new Error(`Unknown language, request=${JSON.stringify(request)}`));
            }
        });
    }
}

export default WorldlyHello;