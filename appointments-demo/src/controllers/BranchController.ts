import * as Alexa from "alexa-sdk";
import {
    BranchService,
} from "../services";
import { IntentController } from "./base/IntentController";

export class BranchController extends IntentController {

    branchService: BranchService;

    constructor(handler: Alexa.Handler<Alexa.Request>) {
        super(handler);
        this.branchService = new BranchService(handler);
    }

    async branchListingIntent(): Promise<void> {

        await this.branchService.branchListing();
    }
}