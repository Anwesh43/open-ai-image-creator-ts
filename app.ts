import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { config } from "dotenv";
import openAiPlugin, { OpenAIHelper } from "./openai.plugin";
import { GenerateImageRequest, GenerateImageResponse } from "./typing";


interface OpenAiFastifyInstance extends FastifyInstance {
    openai : OpenAIHelper
}

const init = async () => {
    config()
    const server : FastifyInstance = fastify()
    server.register(openAiPlugin)
    const newServer : OpenAiFastifyInstance = server as OpenAiFastifyInstance
    server.get("/hello", async (req : FastifyRequest, reply : FastifyReply) => {
        console.log(req.url, req.query)
        const models = await newServer.openai.listModels()
        reply.code(200).send({status: "ok", models})
    })

    server.post("/generate", async (req : FastifyRequest, reply : FastifyReply) => {
        console.log("REQ_BODY", req.body, typeof req.body)
        const body : GenerateImageRequest = JSON.parse(req.body as string) as GenerateImageRequest
        console.log("REQ_BODYAA", body, body.text)
        try {
            const resp : GenerateImageResponse = await newServer.openai.createImage(body.text)
            reply.code(200).send({
                status: "ok",
                data: resp.data.filter(d => !!d.url).map(d => d.url)
            })
        } catch(err) {
            reply.code(500).send({
                status: "error",
                reason: JSON.stringify(err)
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