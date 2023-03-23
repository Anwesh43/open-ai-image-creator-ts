import { FastifyInstance, FastifyServerOptions } from "fastify";
import { Configuration, CreateImageRequest, ListModelsResponse, OpenAIApi } from "openai";
import fp from 'fastify-plugin'
export class OpenAIHelper {

    api : OpenAIApi

    constructor() {
        const configuration = new Configuration({
            apiKey: process.env.OPEN_AI_KEY || '',
            organization: process.env.OPEN_AI_ORGID || ''
        })
        this.api = new OpenAIApi(configuration)
    }

    async listModels() : Promise<ListModelsResponse> {
       const models =  await this.api.listModels()
       return models.data
    }
}

const openAiPlugin = (fastify : FastifyInstance, opts : FastifyServerOptions, next : () => void) => {
    console.log(opts)
    fastify.decorate("openai", new OpenAIHelper()) 
    next()
}

export default fp(openAiPlugin)