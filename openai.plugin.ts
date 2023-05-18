import { FastifyInstance, FastifyServerOptions } from "fastify";
import { Configuration, CreateCompletionRequest, CreateImageRequest, ImagesResponse, ListModelsResponse, OpenAIApi } from "openai";
import fp from 'fastify-plugin'
import { GenerateImageResponse, SummarizeResponse } from "./typing";
import axios from 'axios'
const openApiInstance = axios.create({
    baseURL: "https://api.openai.com/v1/"
})

openApiInstance.interceptors.request.use((req) => {
    req.headers.Authorization = `Bearere ${process.env.OPEN_AI_KEY || ''}`
    return req 
})

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
            size: "512x512" 

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

    async createImageEdit(prompt : string, input : any) {
        // const size = "512x512"
        try {
            const response = await this.api.createImageEdit(input, prompt)
            console.log("Response", response)
        } catch(err) {
            console.log("Error", err)
        }
    }

    async summarize(topic : string, text : string) : Promise<SummarizeResponse> {
        const temperature = 0
        try {
            const prompt : string = `Summarize this ${topic}:\n\n${text.replace(/\\n/g, ' ')}\n`
            const request : CreateCompletionRequest = {
                prompt,
                model: 'text-davinci-003', 
                temperature,

            }
            const response = await this.api.createCompletion(request)
            console.log("RESPONSE_OPENAI", response.data, prompt)
            return {
                response : response.data
            }
        } catch(err) {
            const error : any = err 
            console.error("OPEN_AI_ERROR", error.response.data)
            return {
                response : err
            }
        }
    }
}

const openAiPlugin = (fastify : FastifyInstance, opts : FastifyServerOptions, next : () => void) => {
    console.log(opts)
    fastify.decorate("openai", new OpenAIHelper()) 
    next()
}

export default fp(openAiPlugin)