import axios from "axios";
import { FastifyInstance, FastifyServerOptions } from "fastify";
import {writeFileSync} from 'fs'
import { FSHelper } from "./typing";

const fsHelper = (fastify : FastifyInstance, opts : FastifyServerOptions, next : () => void) => {
    console.log("FSHelper", opts)
    const helper : FSHelper = {
        async downloadFile(prompt : string, url? : string) {
            if (!url) {
                return 
            }
            const response = await axios.get(url, {responseType: "arraybuffer"})
            const data = Buffer.from(response.data, 'binary').toString('base64')
            writeFileSync(`${prompt.split(" ").join("+")}.png`, data)
            console.log("Written to file")
        }
    }
    fastify.decorate("fs", helper)
    next()
}

export default fsHelper