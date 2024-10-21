import connect from '@/database/connect';
import { NextApiRequest, NextApiResponse } from 'next';
import simpleComputeDataset from "@/oceancli/metadata/simpleComputeDataset.json";
import { assetQueue, startComputeQueue } from '@/queue';
import Job, {JOB_STATES, JOB_TYPES} from '@/database/models/job';
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // need to validate
        const {
            owner,
            experimentId,
            runId,
            graphNodeId,
            nodeUrl,
            datasets,
            algo,
            computeEnvId
        } = req.body;
        if (owner && nodeUrl && datasets && algo && computeEnvId) {
            try {
                // Create a Job here
                let job = new Job({
                    owner: owner,
                    experiment_id: experimentId,
                    run_id: runId,
                    graph_node_id: graphNodeId,
                    ocean_node_url: nodeUrl,
                    job_type: JOB_TYPES.PUBLISH_COMPUTE,
                    state: JOB_STATES.PROCESSING
                });
                let saveJob = await job.save();
                let data = {nodeUrl, args: ["computeStart", datasets, algo, computeEnvId], jobId: saveJob._id};
                startComputeQueue.add(data);
                return res.status(200).send({success: true, jobId: saveJob._id});
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