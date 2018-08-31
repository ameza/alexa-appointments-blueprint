import * as Alexa from "alexa-sdk";
import { Configuration } from "../models";
import { ConfigurationRepository } from "../repositories";

export class ConfigurationService {
    configurationRepository: ConfigurationRepository;

    constructor() {
        this.configurationRepository = new ConfigurationRepository();
    }

    async getModelConfiguration(): Promise<Configuration> {
        return await this.configurationRepository.findOne();
    }
}