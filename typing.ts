import { FastifyInstance } from "fastify"
import { ChatCompletionRequestMessage } from "openai"
import { OpenAIHelper } from "./openai.plugin"

interface URLEntry {
    url?: string 
}
export interface GenerateImageResponse {
    data : Array<URLEntry>,
    created : number 
}

export interface GenerateImageRequest {
    text : string 
}

export interface FSHelper {
    downloadFile : (prompt : string, url? : string) => Promise<void>
}

export interface OpenAiFastifyInstance extends FastifyInstance {
    openai? : OpenAIHelper
    fs? : FSHelper
}

export interface CompletionBody {
    input : string, 
    topic : string 
}

export interface SummarizeResponse {
   response : any 
}

export interface ChatOnArticleBody {
    article : string, 
    history : Array<ChatCompletionRequestMessage>,
    message : string 
}