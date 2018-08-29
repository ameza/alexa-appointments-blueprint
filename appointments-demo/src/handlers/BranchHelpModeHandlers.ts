import * as Alexa from "alexa-sdk";
import {BranchController} from "../controllers";

export const BranchHelpModeHandlers  = Alexa.CreateStateHandler("BRANCH_HELP_MODE", {

    Unhandled() {

        console.info("BRANCH_HELP_MODE unhandled");
        this.emit("AMAZON.HelpIntent", true);
    },

    BranchListingIntent() {

    },
});