import * as Alexa from "alexa-sdk";

import { IntentController } from "./IntentController";

class HelloWorldController extends IntentController {

    constructor(handler: Alexa.Handler<Alexa.Request>) {
        super(handler);
    }

    sayHello(): void {
        this.handler.emit(":tell", "Hello World");
    }
}

export default HelloWorldController;