import axios from "axios";
import { FastifyInstance, FastifyServerOptions } from "fastify";
import {writeFileSync} from 'fs'
import { FSHelper } from "./typing";
import fp from "fastify-plugin";

const fsHelper = (fastify : FastifyInstance, opts : FastifyServerOptions, next : () => void) => {
    console.log("FSHelper", opts)
    const helper : FSHelper = {
        async downloadFile(prompt : string, url? : string) {
            if (!url) {
                return 
            }
            const response = await axios.get(url, {responseType: "arraybuffer"})
            const data = Buffer.from(response.data, 'binary').toString('base64')
            console.log("BASE64_DATA", data)
            writeFileSync(`${prompt.split(" ").join("+")}.png`, Buffer.from(data, 'base64'))
            console.log("Written to file")
        }
    }
    fastify.decorate("fs", helper)
    next()
}

export default fp(fsHelper)