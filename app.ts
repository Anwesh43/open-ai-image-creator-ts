import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { config } from "dotenv";
import openAiPlugin from "./openai.plugin";
import { GenerateImageRequest, GenerateImageResponse, OpenAiFastifyInstance } from "./typing";
import fsHelper from "./fs.plugin";



const map : Record<string, Array<string | undefined>>  = {

}
const init = async () => {
    config()
    const server : FastifyInstance = fastify()
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