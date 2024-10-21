import Queue from "bull";
import connect from "@/database/connect";
import { start } from "@/oceancli";
import Job, { JOB_STATES } from "@/database/models/job";
import dotenv from "dotenv";
dotenv.config();
const REDIS_SERVER = process.env.REDIS_SERVER;
const assetQueue = new Queue("asset", `redis://${REDIS_SERVER}:6379`);
const startComputeQueue = new Queue("compute", `redis://${REDIS_SERVER}:6379`);
assetQueue.process(async (job) => {
    
    const {nodeUrl, args, jobId} = job.data;
    try {
        console.log("Start Job");
        await connect({});
        // process here
        let result = await start(nodeUrl, args);
        if (result.success) {
            let jobObj = await Job.findOneAndUpdate({ _id: jobId}, {state: JOB_STATES.FINISHED, result: {ddoId: result.assetId}});
            console.log("Success to execute job:", jobObj);
        } else {
            let jobObj = await Job.findOneAndUpdate({ _id: jobId}, {state: JOB_STATES.FAILED, result: {message: result.message}});
            console.log("Failed to execute job:", jobObj)
        }
        
    } catch(e) {
        let jobObj = await Job.findOneAndUpdate({ _id: jobId}, {state: JOB_STATES.FAILED, result: {message: e.message}});
        console.log("Failed to execute job:", jobObj)
    }

})

startComputeQueue.process( async (job) => {
    const {nodeUrl, args, jobId} = job.data;
    try {
        console.log("Start Job");
        await connect({});
        // process here
        let result = await start(nodeUrl, args);
        if (result.success) {
            let jobObj = await Job.findOneAndUpdate({ _id: jobId}, {state: JOB_STATES.FINISHED, result: result.result});
            console.log("Success to execute job:", jobObj);
        } else {
            let jobObj = await Job.findOneAndUpdate({ _id: jobId}, {state: JOB_STATES.FAILED, result: {message: result.message}});
            console.log("Failed to execute job:", jobObj)
        }
        
    } catch(e) {
        console.log("Fail to execute Job: ", e);
        await Job.findOneAndUpdate({ _id: jobId}, {state: JOB_STATES.FAILED, result: {message: e.message}});
    }
})

export {
    assetQueue,
    startComputeQueue
}