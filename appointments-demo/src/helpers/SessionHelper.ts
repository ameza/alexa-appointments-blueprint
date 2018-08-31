import * as Alexa from "alexa-sdk";
import {Intent, SlotValue} from "alexa-sdk/index";
import { MatchedSlot } from "../models";

export class SessionHelper {

    static getMatchedSlotValue  (handler: Alexa.Handler<Alexa.Request>, intentName: string, slotName: string): MatchedSlot {
        let result: MatchedSlot = new MatchedSlot();
        const slotAttributes = handler.attributes["temp_" + intentName];
        if (slotAttributes) {
            let tempSlots = slotAttributes.slots;

            Object.keys(tempSlots).forEach(currentSlot => {
                if (tempSlots[currentSlot].name === slotName) {
                    result.resolutions = tempSlots[currentSlot].resolutions;
                    result.confirmationStatus = tempSlots[currentSlot].confirmationStatus;
                    result.value = tempSlots[currentSlot].value;
                }
            }, this);

            if (!!result.value) {
                if (result.resolutions &&
                    result.resolutions.resolutionsPerAuthority &&
                    result.resolutions.resolutionsPerAuthority[0] &&
                    result.resolutions.resolutionsPerAuthority[0].status &&
                    result.resolutions.resolutionsPerAuthority[0].status.code &&
                    result.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH") {
                    result.successMatch = true;
                    if (result.resolutions.resolutionsPerAuthority[0] &&
                        result.resolutions.resolutionsPerAuthority[0].values[0] &&
                        result.resolutions.resolutionsPerAuthority[0].values[0].value &&
                        result.resolutions.resolutionsPerAuthority[0].values[0].value.name)
                    result.realValue = result.resolutions.resolutionsPerAuthority[0].values[0].value.name;
                }
            }
            return result;
        }
    }
}
