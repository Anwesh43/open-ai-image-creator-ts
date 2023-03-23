import { FastifyInstance, FastifyServerOptions } from "fastify";
import { Configuration, CreateImageRequest, ImagesResponse, ListModelsResponse, OpenAIApi } from "openai";
import fp from 'fastify-plugin'
import { GenerateImageResponse } from "./typing";
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

    async createImage(prompt : string) : Promise<ImagesResponse> {
        const body : CreateImageRequest = {
            prompt,
            n:2, 
            size: "256x256" 

        }
        console.log("REQUEST_BODY_TO_OPENAI", body)
        try {
            const response = await this.api.createImage(body)
            return response.data as GenerateImageResponse
        } catch(err) {
            //console.log("Error", err)
            const errObj = err as any 
            console.log(errObj.response)
            throw err
        }
    }
}

const openAiPlugin = (fastify : FastifyInstance, opts : FastifyServerOptions, next : () => void) => {
    console.log(opts)
    fastify.decorate("openai", new OpenAIHelper()) 
    next()
}

export default fp(openAiPlugin)