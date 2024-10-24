import Job, { JOB_STATES, JOB_TYPES } from "@/database/models/job";
import { start } from "@/oceancli";
import simpleComputeDataset from "@/oceancli/metadata/simpleComputeDataset.json";
import fs from "fs";
import { Octokit } from "octokit";
import tar from 'tar-fs';
import { downloadAndPublishQueue } from ".";
// var getDDOForce = {};
const downloadAndPublish = async (nodeUrl, args, destinationNodeUrls, jobId, accountNumber) => {
    try {
        let result = await start(nodeUrl, args, accountNumber);
        if (result.success) {
            const octokit = new Octokit({
                auth: process.env.GIT_TOKEN
            })
            // Process tar file
            let newPath: string = result.filePath.replace("out", "tar");

            fs.renameSync(result.filePath, newPath);
            let lastSplashIndex = newPath.lastIndexOf("/");
            let extractPath = newPath.slice(0, lastSplashIndex);
            fs.createReadStream(newPath).pipe(tar.extract(extractPath));

            await new Promise(resolve => setTimeout(resolve, 3000));

            let files = fs.readdirSync(extractPath + "/outputs");
            const fileContent = fs.readFileSync(extractPath + "/outputs/" + files[0], { encoding: 'base64' });

            // Need to change filename based on settings
            let pathParts = result.filePath.split("/");
            let gitFileName = process.env.GIT_FOLDER_PATH! + "/" + pathParts[pathParts.length - 2] + "/" + files[0];
            // return;
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
            let ddos: { nodeUrl: string, ddoId: string, filePath: string }[] = [];
            console.log("=========================================")
            console.log("Publish dataset to:", destinationNodeUrls);
            console.log("=========================================")
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
                    let result = await start(destinationNodeUrl, ["publish", ddo, false], accountNumber);
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
                                    ddos.push({ nodeUrl: destinationNodeUrl, ddoId: ddoId, filePath:  downloadUrl});
                                    clearInterval(checkDBInterval);
                                }
                            } catch (e) {
                                clearInterval(checkDBInterval);
                                console.log(e);
                            }

                        }, 10000)

                        // if (!getDDOForce[destinationNodeUrl]) {
                        //     getDDOForce[destinationNodeUrl] = true;
                        //     start(destinationNodeUrl, ["getDDO", ddoId + "/true"], accountNumber).then(() => {
                        //         getDDOForce[destinationNodeUrl] = false
                        //     });
                        // }

                        start(destinationNodeUrl, ["getDDO", ddoId + "/true"], accountNumber)
                        
                    }
                }
            }

            let updateJobInterval = setInterval(async function () {
                if (ddos.length && (ddos.length === destinationNodeUrls.length)) {
                    await Job.findOneAndUpdate({ _id: jobId }, { state: JOB_STATES.FINISHED, result: ddos });
                    clearInterval(updateJobInterval);
                }

            }, 5000)

        } else {
            await Job.findOneAndUpdate({ _id: jobId }, { state: JOB_STATES.FAILED, result: { message: "Could not download file" } });
        }
    } catch (e) {
        console.log(e);
        await Job.findOneAndUpdate({ _id: jobId }, { state: JOB_STATES.FAILED, result: { message: e.message } });
    }
}

const createDownloadAndPublishJob = async (currentNode, oceanNodeJobId, run, outgoingNodes, accountNumber) => {
    let newJob = new Job({
        owner: run.owner,
        experiment_id: run.experiment_id,
        run_id: run._id,
        graph_node_id: currentNode.id,
        ocean_node_url: currentNode.data.ocean_node_address,
        job_type: JOB_TYPES.PUBLISH_ASSET,
        state: JOB_STATES.PROCESSING
    })
    let savedJob = await newJob.save();
    downloadAndPublishQueue.add({
        nodeUrl: currentNode.data.ocean_node_address,
        args: [
            "downloadJobResults",
            oceanNodeJobId,
            1,
            null],
        destinationNodeUrls: outgoingNodes.map(node => node.data.ocean_node_address),
        jobId: savedJob._id,
        accountNumber: accountNumber
    })
}

export {
    createDownloadAndPublishJob, downloadAndPublish
};
