import connect from "@/database/connect";
import Job, { JOB_STATES } from "@/database/models/job";
import { start } from "@/oceancli";
import Queue from "bull";
import dotenv from "dotenv";
import { downloadAndPublish } from "./downloadPublishAsset";
import { executeComputeGraph, startCompute } from "./handleCompute";

dotenv.config();
const REDIS_SERVER = process.env.REDIS_SERVER;
const assetQueue = new Queue("asset", `redis://${REDIS_SERVER}:6379`);
const startComputeQueue = new Queue("compute", `redis://${REDIS_SERVER}:6379`);
const downloadAndPublishQueue = new Queue("downloadAndPublish", `redis://${REDIS_SERVER}:6379`);
const executeComputeGraphQueue = new Queue("executeComputeGraph", `redis://${REDIS_SERVER}:6379`);

assetQueue.process(async (job) => {

    const { nodeUrl, args, jobId } = job.data;
    try {
        console.log("Start Job");
        await connect({});
        // process here
        let result = await start(nodeUrl, args, 0);

        if (result.success) {
            let ddoId = result.assetId;
            // add /true for force search

            // Check Interval
            let url = new URL(nodeUrl);
            let typesenseUrl = `${url.protocol}//${url.hostname}:8108`;
            let checkDBInterval = setInterval(async function () {
                try {
                    console.log("Searching Database");
                    let req = await fetch(`${typesenseUrl}/collections/op_ddo_v4.1.0/documents/search?q=*&filter_by=id:=${ddoId}`, {
                        headers: {
                            "X-TYPESENSE-API-KEY": "xyz"
                        }
                    });
                    let res = await req.json();
                    console.log("FOUND:", res.found);
                    if (res.found) {
                        // Update DB here
                        console.log("Found DDO with ID:", ddoId);
                        let jobObj = await Job.findOneAndUpdate({ _id: jobId }, { state: JOB_STATES.FINISHED, result: { ddoId: result.assetId } });
                        console.log("Success to execute job:", jobObj);
                        clearInterval(checkDBInterval);
                    }
                } catch (e) {
                    console.log(e);
                }

            }, 10000)
            start(nodeUrl, ["getDDO", ddoId + "/true"], 0);
        } else {
            let jobObj = await Job.findOneAndUpdate({ _id: jobId }, { state: JOB_STATES.FAILED, result: { message: result.message } });
            console.log("Failed to execute job:", jobObj)
        }

    } catch (e) {
        let jobObj = await Job.findOneAndUpdate({ _id: jobId }, { state: JOB_STATES.FAILED, result: { message: e.message } });
        console.log("Failed to execute job:", jobObj)
    }

})



startComputeQueue.process((job) => {
    const { nodeUrl, args, jobId, accountNumber } = job.data;
    startCompute(nodeUrl, args, jobId, accountNumber);
})


downloadAndPublishQueue.process((job) => {
    const { nodeUrl, args, destinationNodeUrls, jobId, accountNumber } = job.data;
    downloadAndPublish(nodeUrl, args, destinationNodeUrls, jobId, accountNumber);
})


executeComputeGraphQueue.process(async (job) => {
    const { run } = job.data;
    await connect({});
    executeComputeGraph(run);
})


export {
    assetQueue, downloadAndPublishQueue,
    executeComputeGraphQueue, startComputeQueue
};

