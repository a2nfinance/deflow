import connect from '@/database/connect';
import Job, { JOB_STATES, JOB_TYPES } from '@/database/models/job';
import { start } from "@/oceancli/index";
import { downloadAndPublishQueue } from '@/queue';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // need to validate
        const {
            owner,
            nodeUrl,
            envIdAndJobId,
            index,
            path,
            destinationNodeUrl,
            outputFileName
        } = req.body;
        if (nodeUrl && envIdAndJobId) {
            try {
                // Create job here
                let job = new Job({
                    owner: owner,
                    ocean_node_url: nodeUrl,
                    job_type: JOB_TYPES.PUBLISH_ASSET,
                    state: JOB_STATES.PROCESSING
                });
                let savedJob = await job.save();
                downloadAndPublishQueue.add({
                    nodeUrl: nodeUrl, 
                    args: ["downloadJobResults", envIdAndJobId, index, path], 
                    destinationNodeUrl: [destinationNodeUrl],
                    outputFileName: outputFileName,
                    jobId: savedJob._id
                })
                res.status(200).send({success: true, jobId: savedJob._id});
            } catch (error) {
                console.log(error)
                return res.status(500).send(error.message);
            }
        } else {
            res.status(422).send('data_incomplete');
        }
    } else {
        res.status(422).send('req_method_not_supported');
    }
};

export default connect(handler);