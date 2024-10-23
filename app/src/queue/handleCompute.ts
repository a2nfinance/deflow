import connect from "@/database/connect";
import Job, { JOB_STATES, JOB_TYPES } from "@/database/models/job";
import { start } from "@/oceancli";
import { getIncomingEdges, getOutgoingEdges } from "@/utils/getExecutionOrders";
import { startComputeQueue } from ".";
import { createDownloadAndPublishJob } from "./downloadPublishAsset";
import { checkCompleteWorkflow, getAccountNumberForNodes } from "./utils";
const startCompute = async (nodeUrl, args, jobId, accountNumber) => {
    try {
        console.log("Start Job");
        await connect({});
        // process here
        let result = await start(nodeUrl, args, accountNumber);
        if (result.success) {
            let oceanNodeJobId = result.result.oceanNodeJobId;
            // Check Interval
            let url = new URL(nodeUrl);
            let typesenseUrl = `${url.protocol}//${url.hostname}:8108`;
            let checkDBInterval = setInterval(async function () {
                try {
                    console.log("Searching Database");
                    let req = await fetch(`${typesenseUrl}/collections/c2djobs/documents/search?q=*&filter_by=id:=${oceanNodeJobId}`, {
                        headers: {
                            "X-TYPESENSE-API-KEY": "xyz"
                        }
                    });
                    let res = await req.json();
                    if (res.found) {
                        // Update DB here
                        console.log("Found Ocean Node JOB with ID:", oceanNodeJobId);
                        let document = res.hits[0].document;
                        let oceanNodeJobStatus = document.status;
                        let jobObj = await Job.findOneAndUpdate(
                            { _id: jobId }, 
                            { 
                                state: oceanNodeJobStatus === 70 ? JOB_STATES.FINISHED : JOB_STATES.PROCESSING, 
                                result: result.result 
                            }
                        );
                        console.log("Success to execute job:", jobObj, oceanNodeJobId);
                        clearInterval(checkDBInterval);
                    }
                } catch (e) {
                    console.log(e);
                }

            }, 10000)
           
        } else {
            let jobObj = await Job.findOneAndUpdate({ _id: jobId }, { state: JOB_STATES.FAILED, result: { message: result.message } });
            console.log("Failed to execute job:", jobObj)
        }

    } catch (e) {
        console.log("Fail to execute Job: ", e);
        await Job.findOneAndUpdate({ _id: jobId }, { state: JOB_STATES.FAILED, result: { message: e.message } });
    }
}
const createExecuteJob = async (node, run, accountNumber, datasets?) => {
    let newJob = new Job({
        owner: run.owner,
        experiment_id: run.experiment_id,
        run_id: run._id,
        graph_node_id: node.id,
        ocean_node_url: node.data.ocean_node_address,
        job_type: JOB_TYPES.PUBLISH_COMPUTE,
        state: JOB_STATES.PROCESSING
    })
    let savedJob = await newJob.save();
    startComputeQueue.add({
        nodeUrl: node.data.ocean_node_address,
        args: ["startCompute", datasets?.length ? datasets : [node.data.dataasset_id], node.data.algorithm_id, node.data.compute_env_id],
        jobId: savedJob._id,
        accountNumber: accountNumber
    })

}

const executeComputeGraph = async (run) => {
    const { nodes, edges, orders } = run;
    const accountNumbers = getAccountNumberForNodes(nodes);
    const numberOfActions = 2 * nodes.length - 1;
    // Init all first jobs for Input node here
    let firstNodes = nodes.filter(node => orders[0].indexOf(node.id) !== -1);
    for (let i = 0; i < firstNodes.length; i++) {
        let accountNumber = accountNumbers[firstNodes[i].data.ocean_node_address];
        createExecuteJob(firstNodes[i], run, accountNumber);
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
                        let accountNumber = accountNumbers[currentNode.data.ocean_node_address];
                        createDownloadAndPublishJob(currentNode, jobsForNode[0].result.oceanNodeJobId, run, outgoingNodes, accountNumber);
                    }

                    if (jobsForNode.length === 2) {
                        statuses = jobsForNode.map(j => j.state === JOB_STATES.FINISHED);
                    }
                }

                if (statuses.indexOf(false) === -1) {
                    let nextLayerInOrder = orders[i + 1];
                    let nextLayerNodes = nodes.filter(node => orders[i + 1].indexOf(node.id) !== 1);
                    for (let k = 0; k < nextLayerInOrder.length; k++) {
                        let currentNode = nextLayerNodes[k];
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
                            for (let l = 0; l < downloadAndPublishJobs.length; l++) {
                                datasets.push(
                                    downloadAndPublishJobs[l].result.filter(
                                        ddo => ddo.nodeUrl === currentNode.data.ocean_node_address
                                    )[0]
                                )
                            }

                            // start first job for the next node
                            let accountNumber = accountNumbers[currentNode.data.ocean_node_address];
                            createExecuteJob(currentNode, run, accountNumber, datasets);

                        }
                    }
                }
            }


        }
    }, 5000)
}

export {
    createExecuteJob, executeComputeGraph, startCompute
};

