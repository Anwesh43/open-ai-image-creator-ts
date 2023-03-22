import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { config } from "dotenv";

const init = async () => {
    config()
    const server : FastifyInstance = fastify()
    server.get("/hello", (req : FastifyRequest, reply : FastifyReply) => {
        console.log(req.url, req.query)
        reply.code(200).send({status: "ok"})
    })
    try {

        await server.listen({
            port: 3000
        })
        console.log("started server")
    } catch(ex) {
        console.log("failed to start server")
    }
    
}

init()