import connect from "@/database/connect";
import Job, { JOB_STATES, JOB_TYPES } from "@/database/models/job";
import { start } from "@/oceancli";
import { getGraph, getIncomingEdges, getOutgoingEdges } from "@/utils/getExecutionOrders";
import { startComputeQueue } from ".";
import { createDownloadAndPublishJob, downloadAndPushToGithub } from "./downloadPublishAsset";
import { checkCompleteWorkflow, getAccountNumberForNodes, oneOfJobFail } from "./utils";
const startCompute = async (nodeUrl, args, jobId, accountNumber) => {
    try {
        console.log("=================================================")
        console.log("Start a compute job with ID:", jobId);
        await connect({});
        // process here
        let result = await start(nodeUrl, args, accountNumber);
        if (result.success) {
            let oceanNodeJobId = result.result.oceanNodeJobId.split("-")[1];
            // Check Interval
            let url = new URL(nodeUrl);
            let typesenseUrl = `${url.protocol}//${url.hostname}:8108`;
            let checkDBInterval = setInterval(async function () {
                try {
                    console.log("=================================================")
                    console.log("Searching typesense database for created Ocean Node job");
                    let req = await fetch(`${typesenseUrl}/collections/c2djobs/documents/search?q=*&filter_by=id:=${oceanNodeJobId}`, {
                        headers: {
                            "X-TYPESENSE-API-KEY": "xyz"
                        }
                    });
                    let res = await req.json();
                    if (res.found) {

                        // Update DB here
                        console.log("Found Ocean Node job with ID:", oceanNodeJobId);
                        let document = res.hits[0].document;
                        let oceanNodeJobStatus = document.status;
                        if (oceanNodeJobStatus === 70) {
                            let jobObj = await Job.findOneAndUpdate(
                                { _id: jobId },
                                {
                                    state: JOB_STATES.FINISHED,
                                    result: result.result
                                }
                            );
                            console.log("Success to execute job:", jobObj, oceanNodeJobId);
                            clearInterval(checkDBInterval);
                        }

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
const createExecuteJob = async (node, run, accountNumber, datasets?: any[]) => {
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
    let datasetList = "[]";
    if (datasets?.length) {
        datasetList = "[" + datasets.join(",") + "]";
    } else {
        datasetList = node.data.dataasset_id;
    }
    startComputeQueue.add(
        {
            nodeUrl: node.data.ocean_node_address,
            args: ["startCompute", datasetList, node.data.algorithm_id, node.data.compute_env_id],
            jobId: savedJob._id,
            accountNumber: accountNumber
        }, 
        { jobId: savedJob._id.toString() }
    )

}

const executeComputeGraph = async (run) => {
    const { nodes, edges, orders } = run;
    let graph = getGraph(edges);
    const accountNumbers = getAccountNumberForNodes(nodes);
    const numberOfActions = nodes.length + graph.length;
    // Init all first jobs for Input node here
    let jobs = await Job.find({ run_id: run._id });
    let firstNodes = nodes.filter(node => orders[0].indexOf(node.id) !== -1);
    for (let i = 0; i < firstNodes.length; i++) {
        let accountNumber = accountNumbers[firstNodes[i].data.ocean_node_address];
        let getStartExcuteJobsOfNode = jobs.filter(
            job => job.graph_node_id === firstNodes[i].id && job.job_type === JOB_TYPES.PUBLISH_COMPUTE && job.state == JOB_STATES.FINISHED
        );
        if (getStartExcuteJobsOfNode.length === 0) {
            createExecuteJob(firstNodes[i], run, accountNumber);
        }

    }
    let doJobInterval = setInterval(async function () {
        let jobs = await Job.find({ run_id: run._id })
        if (oneOfJobFail(jobs)) {
            console.log("Fail to execute computation graph: one of jobs has failed");
            clearInterval(doJobInterval);
        }
        if (checkCompleteWorkflow(jobs, numberOfActions)) {
            /// Do last action here
            let lastJob = jobs[numberOfActions - 1];
            await downloadAndPushToGithub(
                lastJob.ocean_node_url,
                [
                    "downloadJobResults",
                    lastJob.result.oceanNodeJobId,
                    1,
                    null
                ],
                lastJob._id,
                accountNumbers[lastJob.ocean_node_url!]
            )
            console.log("=======================================")
            console.log("All steps in the computation graph have been executed successfully!");
            console.log("=======================================")
            clearInterval(doJobInterval);
        } else {
            console.log("==========================================================================")
            console.log("Layers in the compute execution order:", orders);
            for (let i = 0; i < orders.length - 1; i++) {
                console.log("== Checking jobs for all nodes in the layer:", i);
                let statuses = orders[i].map(() => false);
                for (let j = 0; j < orders[i].length; j++) {
                    console.log("---- Checking jobs for node ID:", orders[i][j]);
                    let currentNode = nodes.filter(node => orders[i][j] === node.id)[0];
                    let graphNodeId = orders[i][j];
                    let jobsForNode = jobs.filter(jb => jb.graph_node_id === graphNodeId);
                    if (jobsForNode.length === 1 && jobsForNode[0].job_type === JOB_TYPES.PUBLISH_COMPUTE && jobsForNode[0].state === JOB_STATES.FINISHED) {
                        // Second job: Start download and publish DDO job here
                        // New Job
                        let outgoingEdges = getOutgoingEdges(graph, graphNodeId);
                        let outgoingNodeIDs = outgoingEdges.map(e => e[1]);
                        let outgoingNodes = nodes.filter(node => outgoingNodeIDs.indexOf(node.id) !== -1);
                        // Download and Publish to git here
                        let accountNumber = accountNumbers[currentNode.data.ocean_node_address];
                        console.log("---- Create second job to download and publish dataasset:", currentNode.data.label);
                        createDownloadAndPublishJob(currentNode, jobsForNode[0].result.oceanNodeJobId, run, outgoingNodes, accountNumber);
                    }

                    if (jobsForNode.length === 2) {
                        let finishedStates = jobsForNode.filter(jfn => jfn.state === JOB_STATES.FINISHED);
                        if (finishedStates.length === 2) {
                            console.log("---- All jobs have been completed for node ID:", graphNodeId);
                            statuses[j] = true;
                        } else {
                            console.log("---- More jobs needs to be executed on node ID:", graphNodeId);
                        }
                    }
                }
                console.log("---- Have all previous jobs been completed? >", statuses);
                if (statuses.indexOf(false) === -1) {
                    let nextLayerInOrder = orders[i + 1];
                    console.log("== Checking the next layer in the compute execution order:", nextLayerInOrder);
                    for (let k = 0; k < nextLayerInOrder.length; k++) {
                        let currentNode = nodes.filter(node => nextLayerInOrder[k] === node.id)[0];
                        let graphNodeId = nextLayerInOrder[k];
                        let jobsForNode = jobs.filter(j => j.graph_node_id === graphNodeId);
                        if (!jobsForNode.length) {

                            // calculate asset from Job
                            let incomingEdges = getIncomingEdges(graph, graphNodeId);
                            let incomingNodeIds = incomingEdges.map(e => e[0]);
                            let finisedDownloadAndPublishJobs = jobs.filter(
                                j => incomingNodeIds.indexOf(j.graph_node_id!) !== -1 && j.job_type === JOB_TYPES.PUBLISH_ASSET && j.state === JOB_STATES.FINISHED
                            );
                            if (finisedDownloadAndPublishJobs.length === incomingNodeIds.length) {
                                let datasets: string[] = [];
                                for (let l = 0; l < finisedDownloadAndPublishJobs.length; l++) {
                                    let ddo = finisedDownloadAndPublishJobs[l].result.filter(
                                        ddo => ddo.nodeUrl === currentNode.data.ocean_node_address
                                    )[0];

                                    datasets.push(
                                        ddo.ddoId
                                    )
                                }

                                // start first job for the next node
                                let accountNumber = accountNumbers[currentNode.data.ocean_node_address];
                                console.log("Create the first job, startCompute, for current node:", currentNode.data.label);
                                createExecuteJob(currentNode, run, accountNumber, datasets);
                            }


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

