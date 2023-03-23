import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { config } from "dotenv";
import openAiPlugin, { OpenAIHelper } from "./openai.plugin";


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