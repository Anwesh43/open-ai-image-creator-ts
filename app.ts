import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { config } from "dotenv";
import openAiPlugin from "./openai.plugin";
import { ChatOnArticleBody, CompletionBody, GenerateImageRequest, GenerateImageResponse, OpenAiFastifyInstance } from "./typing";
import fsHelper from "./fs.plugin";
import fastifyStatic from '@fastify/static'
import fastifyMultipart from "@fastify/multipart";
import path from "path";
import {File} from '@web-std/file'
const map : Record<string, Array<string | undefined>>  = {

}
const init = async () => {
    config()
    const server : FastifyInstance = fastify()
    server.register(fastifyMultipart, {
        limits: {
            fileSize: 100000000
        }
    })
    server.register(fastifyStatic, {
        root: path.join(__dirname, 'public')
    })
    server.register(openAiPlugin)
    server.register(fsHelper)
    const newServer : OpenAiFastifyInstance = server as OpenAiFastifyInstance
    server.get("/hello", async (req : FastifyRequest, reply : FastifyReply) => {
        console.log(req.url, req.query)
        const models = await newServer.openai?.listModels()
        reply.code(200).send({status: "ok", models})
    })

    server.post("/generate", async (req : FastifyRequest, reply : FastifyReply) => {
        console.log("REQ_BODY", req.body, typeof req.body)
        const body : GenerateImageRequest = JSON.parse(req.body as string) as GenerateImageRequest
        console.log("REQ_BODYAA", body, body.text)
        if (map[body.text]) {
            console.log("Got response from cache")
            reply.code(200).send({
                status: "ok",
                data: map[body.text]
            })
            return 
        }
        try {
            const resp : GenerateImageResponse | undefined = await newServer.openai?.createImage(body.text)
            const urls : Array<string|undefined> | undefined = resp?.data.filter(d => !!d.url).map(d => d.url)
            if (urls && urls.length > 0) {
                newServer.fs?.downloadFile(body.text, urls[0]).then(() => {console.log("success")}).catch(console.error)
            }
            if (urls) {
                map[body.text] = urls
            }
            reply.code(200).send({
                status: "ok",
                data: urls
            })
        } catch(err) {
            console.log("Error here", err)
            reply.code(500).send({
                status: "error",
                reason: JSON.stringify(err)
            })
        }
    })

    server.post("/handleImage", async(req : FastifyRequest, reply : FastifyReply) => {
        const file = await req.file()
        if (!!file) {
            const buffer = await file.toBuffer()
            await newServer.openai?.createImageEdit('add mountains behind the couple', new File([buffer], file?.filename))
        }
        reply.send("Done")
    })
    

    server.post("/summarize", async (req : FastifyRequest, reply : FastifyReply) => {
        const body : CompletionBody = req.body as CompletionBody
        console.log("BODY_FROM", body)
        try {
            const resp = await newServer.openai?.summarize(body.topic, body.input)
            reply.send(resp?.response)
        } catch(err) {
            reply.code(500).send({
                err, 
                status: "Internal Error"
            })
        }
    })
    
    server.post("/chat-on-article", async (req : FastifyRequest, reply : FastifyReply) => {
        const body : ChatOnArticleBody = req.body as ChatOnArticleBody
        try {
            const resp = await newServer.openai?.chatCompletion(body.message, body.history, body.article)
            reply.send(resp)
        } catch(err) {
            reply.code(500).send({
                err, 
                status : "Internal Error"
            })
        }
    })

    try {

        await server.listen({
            port: 3000
        })
        console.log("started server")
    } catch(ex) {
        console.log("failed to start server", ex)
    }
    
}

init()