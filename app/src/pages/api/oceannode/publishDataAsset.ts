import connect from '@/database/connect';
import { NextApiRequest, NextApiResponse } from 'next';
import simpleComputeDataset from "@/oceancli/metadata/simpleComputeDataset.json";
import { assetQueue } from '@/queue';
import Job, {JOB_STATES, JOB_TYPES} from '@/database/models/job';
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // need to validate
        const {
            owner,
            nodeUrl,
            assetUrl,
            name,
            publisherTrustedAlgorithms
        } = req.body;
        if (owner && nodeUrl && assetUrl && name) {
            try {
                let ddo = {
                    ...simpleComputeDataset,
                    metadata: {
                        ...simpleComputeDataset.metadata,
                        name: name
                    },
                }
                ddo.services[0].fileObject.url = assetUrl;
                ddo.services[0].serviceEndpoint = nodeUrl;
                ddo.services[0].compute.publisherTrustedAlgorithms = publisherTrustedAlgorithms?.length ? publisherTrustedAlgorithms : [];
                // Create a Job here
                let job = new Job({
                    owner: owner,
                    ocean_node_url: nodeUrl,
                    job_type: JOB_TYPES.PUBLISH_ASSET,
                    state: JOB_STATES.PROCESSING
                });
                let saveJob = await job.save();
                let data = {nodeUrl, args: ["publish", ddo, false], jobId: saveJob._id};
                assetQueue.add(data);
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