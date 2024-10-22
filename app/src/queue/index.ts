import connect from "@/database/connect";
import Job, { JOB_STATES, JOB_TYPES } from "@/database/models/job";
import { start } from "@/oceancli";
import Queue from "bull";
import dotenv from "dotenv";
import fs from "fs";
import { Octokit } from "octokit";
dotenv.config();
const REDIS_SERVER = process.env.REDIS_SERVER;
const assetQueue = new Queue("asset", `redis://${REDIS_SERVER}:6379`);
const startComputeQueue = new Queue("compute", `redis://${REDIS_SERVER}:6379`);
const downloadAndPublishQueue = new Queue("downloadAndPublish", `redis://${REDIS_SERVER}:6379`);
const executeComputeGraphQueue = new Queue("executeComputeGraph", `redis://${REDIS_SERVER}:6379`);

import simpleComputeDataset from "@/oceancli/metadata/simpleComputeDataset.json";
import { getIncomingEdges, getOutgoingEdges } from "@/utils/getExecutionOrders";

assetQueue.process(async (job) => {

    const { nodeUrl, args, jobId } = job.data;
    try {
        console.log("Start Job");
        await connect({});
        // process here
        let result = await start(nodeUrl, args);
        if (result.success) {
            let jobObj = await Job.findOneAndUpdate({ _id: jobId }, { state: JOB_STATES.FINISHED, result: { ddoId: result.assetId } });
            console.log("Success to execute job:", jobObj);
        } else {
            let jobObj = await Job.findOneAndUpdate({ _id: jobId }, { state: JOB_STATES.FAILED, result: { message: result.message } });
            console.log("Failed to execute job:", jobObj)
        }

    } catch (e) {
        let jobObj = await Job.findOneAndUpdate({ _id: jobId }, { state: JOB_STATES.FAILED, result: { message: e.message } });
        console.log("Failed to execute job:", jobObj)
    }

})

startComputeQueue.process(async (job) => {
    const { nodeUrl, args, jobId } = job.data;
    try {
        console.log("Start Job");
        await connect({});
        // process here
        let result = await start(nodeUrl, args);
        if (result.success) {
            let jobObj = await Job.findOneAndUpdate({ _id: jobId }, { state: JOB_STATES.FINISHED, result: result.result });
            console.log("Success to execute job:", jobObj);
        } else {
            let jobObj = await Job.findOneAndUpdate({ _id: jobId }, { state: JOB_STATES.FAILED, result: { message: result.message } });
            console.log("Failed to execute job:", jobObj)
        }

    } catch (e) {
        console.log("Fail to execute Job: ", e);
        await Job.findOneAndUpdate({ _id: jobId }, { state: JOB_STATES.FAILED, result: { message: e.message } });
    }
})

downloadAndPublishQueue.process(async (job) => {
    const { nodeUrl, args, destinationNodeUrls, jobId, outputFilename } = job.data;
    try {
        let result = await start(nodeUrl, args);
        if (result.success) {
            const octokit = new Octokit({
                auth: process.env.GIT_TOKEN
            })

            // Need to change filename based on settings
            let pathParts = result.filePath.split("/");
            let gitFileName = process.env.GIT_FOLDER_PATH! + "/" + pathParts[pathParts.length - 2] + "/" + outputFilename;
            const fileContent = fs.readFileSync(result.filePath, { encoding: 'base64' });
            let uploadResult = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
                owner: process.env.GIT_OWNER!,
                repo: process.env.GIT_REPO!,
                path: gitFileName,
                message: 'Result from Ocean Node Job ID:' + args[1],
                committer: {
                    name: process.env.GIT_NAME!,
                    email: process.env.GIT_EMAIL!
                },
                content: fileContent,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            })
            let ddos: {nodeUrl: string, ddoId: string}[] = [];
            for (let i = 0; i < destinationNodeUrls.length; i++) {
                let destinationNodeUrl = destinationNodeUrls[i];
                if (destinationNodeUrl) {
                    // Create a dataset here
                    let downloadUrl = uploadResult.data.content?.download_url!;
                    let ddo = {
                        ...simpleComputeDataset,
                        metadata: {
                            ...simpleComputeDataset.metadata,
                            name: "Asset from Job " + args[1]
                        },
                    }
                    ddo.services[0].fileObject.url = downloadUrl;
                    ddo.services[0].files.files[0].url = downloadUrl;
                    ddo.services[0].serviceEndpoint = destinationNodeUrl;
                    let result = await start(destinationNodeUrl, ["publish", ddo, false]);
                    console.log("Publish dataset:", result);
                    // request check DDO with force true here
                    if (result.success) {
                        let ddoId = result.assetId;
                        // add /true for force search

                        // Check Interval
                        let url = new URL(destinationNodeUrl);
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
                                    ddos.push({nodeUrl: destinationNodeUrl, ddoId: ddoId});
                                    clearInterval(checkDBInterval);
                                }
                            } catch (e) {
                                console.log(e);
                            }

                        }, 10000)
                        start(destinationNodeUrl, ["getDDO", ddoId + "/true"]);
                    }
                }
            }

            let updateJobInterval = setInterval(async function() {
                if (ddos.length === destinationNodeUrls.length) {
                    await Job.findOneAndUpdate({ _id: jobId }, { state: JOB_STATES.FINISHED, result: ddos });
                    clearInterval(updateJobInterval);
                }
               
            }, 5000)

        } else {
            await Job.findOneAndUpdate({ _id: jobId }, { state: JOB_STATES.FAILED, result: {message: "Could not download file"} });
        }
    } catch (e) {
        console.log(e);
        await Job.findOneAndUpdate({ _id: jobId }, { state: JOB_STATES.FAILED, result: {message: e.message} });
    }

})


executeComputeGraphQueue.process(async (job) => {
    const { run } = job.data;
    await connect({});
    const { nodes, edges, orders } = run;
    const numberOfActions = 2 * nodes.length - 1;
    // Init all first jobs for Input node here
    let firstNodes = nodes.filter(node => orders[0].indexOf(node.id) !== -1);
    for (let i = 0; i < firstNodes.length; i++) {
        createExecuteJob(firstNodes[i], run);
    }
    let doJobInterval = setInterval(async function () {
        let jobs = await Job.find({ run_id: run._id })
        if (checkCompleteWorkflow(jobs, numberOfActions)) {
            clearInterval(doJobInterval);
        } else {

            for (let i = 0; i < orders.length - 1; i++) {
                let statuses = orders[i].map(() => false);
                let currentLayerNodes = nodes.filter(node => orders[i].indexOf(node.id) !== 1);
                for (let j = 0; j < orders[i].length; j++) {
                    let currentNode = currentLayerNodes[j];
                    let graphNodeId = orders[i][j];
                    let jobsForNode = jobs.filter(jb => jb.graph_node_id === graphNodeId);
                    if (jobsForNode.length === 1 && jobsForNode[0].job_type === JOB_TYPES.PUBLISH_COMPUTE && jobsForNode[0].state === JOB_STATES.FINISHED) {
                        // Second job: Start download and publish DDO job here
                        // New Job
                        let outgoingEdges = getOutgoingEdges(edges, graphNodeId);
                        let outgoingNodes = nodes.filter(node => outgoingEdges[1] === node.id);
                        // Download and Publish to git here
                        createDownloadAndPublishJob(currentNode, jobsForNode[0].result.oceanNodeJobId, run, outgoingNodes);
                    }

                    if (jobsForNode.length === 2) {
                        statuses = jobsForNode.map(j => j.state === JOB_STATES.FINISHED);
                    }
                }

                if (statuses.indexOf(false) === -1) {
                    let nextLayerInOrder = orders[i + 1];
                    let nextLayerNodes = nodes.filter(node => orders[i + 1].indexOf(node.id) !== 1);
                    for (let k = 0; k < nextLayerInOrder.length; k++) {
                        let currentNode =  nextLayerNodes[k];
                        let graphNodeId = nextLayerInOrder[k];
                        let jobsForNode = jobs.filter(j => j.graph_node_id === graphNodeId);
                        if (!jobsForNode.length) {
                           

                            // calculate asset from Job
                            let incomingEdges = getIncomingEdges(edges, graphNodeId);
                            let incomingNodes = incomingEdges.map(e => e[0]);
                            let downloadAndPublishJobs = jobs.filter(
                                j => incomingNodes.indexOf(j.graph_node_id!) !== -1 && j.job_type === JOB_TYPES.PUBLISH_ASSET
                            );
                            let datasets: string[] = [];
                            for(let l=0; l < downloadAndPublishJobs.length; l++) {
                                datasets.push(
                                    downloadAndPublishJobs[l].result.filter(
                                        ddo => ddo.nodeUrl === currentNode.ocean_node_address
                                    )[0]
                                )
                            }

                            // start first job for the next node

                            createExecuteJob(currentNode, run, datasets);
                            
                        }
                    }
                }
            }


        }
    }, 5000)

})

const createExecuteJob = async (node, run, datasets?) => {
    let newJob = new Job({
        owner: node.owner,
        experiment_id: run.experiment_id,
        run_id: run._id,
        graph_node_id: node.id,
        ocean_node_url: node.ocean_node_address,
        job_type: JOB_TYPES.PUBLISH_COMPUTE,
        state: JOB_STATES.PROCESSING
    })
    let savedJob = await newJob.save();
    startComputeQueue.add({
        nodeUrl: node.ocean_node_address,
        args: ["startCompute", datasets?.length ? datasets : [node.dataasset_id], node.algorithm_id, node.compute_env_id],
        jobId: savedJob._id
    })

}

const createDownloadAndPublishJob = async(currentNode, oceanNodeJobId, run, outgoingNodes) => {
    let newJob = new Job({
        owner: currentNode.owner,
        experiment_id: run.experiment_id,
        run_id: run._id,
        graph_node_id: currentNode.id,
        ocean_node_url: currentNode.ocean_node_address,
        job_type: JOB_TYPES.PUBLISH_ASSET,
        state: JOB_STATES.PROCESSING
    })
    let savedJob = await newJob.save();
    let outputFilename = currentNode.output_filename;
    downloadAndPublishQueue.add({
        nodeUrl: currentNode.ocean_node_address,
        args: [
            "downloadJobResults",
            oceanNodeJobId,
            1,
            null],
        destinationNodeUrl: outgoingNodes.map(node => node.ocean_node_address),
        jobId: savedJob._id,
        outputFilename: outputFilename
    })
}
const checkCompleteWorkflow = (jobs, numberOfActions) => {
    let isNotFinishJobs = jobs.filter(j => j.state !== JOB_STATES.FINISHED);
    if (jobs.length !== numberOfActions || isNotFinishJobs.length) {
        return false;
    }
    return true;
}

export {
    assetQueue, downloadAndPublishQueue,
    executeComputeGraphQueue, startComputeQueue
};
