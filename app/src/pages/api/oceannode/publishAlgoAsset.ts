import connect from '@/database/connect';
import Job, { JOB_STATES, JOB_TYPES } from '@/database/models/job';
import pythonAlgo from "@/oceancli/metadata/pythonAlgo.json";
import { assetQueue } from '@/queue';
import { NextApiRequest, NextApiResponse } from 'next';
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // need to validate
        const {
            owner,
            nodeUrl,
            assetUrl,
            name,
            entrypoint,
            image,
            tag,
            checksum
        } = req.body;
        if (owner && nodeUrl && assetUrl && name && entrypoint && image && checksum) {
            try {
                let ddo = {
                    ...pythonAlgo,
                    metadata: {
                        ...pythonAlgo.metadata,
                        name: name
                    },
                }
                ddo.services[0].fileObject.url = assetUrl;
                ddo.services[0].files.files[0].url = assetUrl;
                ddo.services[0].serviceEndpoint = nodeUrl;
                ddo.metadata.created = (new Date()).toISOString();
                ddo.metadata.updated = (new Date()).toISOString();
                // Update metadata
                ddo.metadata.algorithm.container = {
                    ...ddo.metadata.algorithm.container,
                    entrypoint: entrypoint,
                    image: image,
                    tag: tag,
                    checksum: checksum
                }
                // Create a Job here
                let job = new Job({
                    owner: owner,
                    ocean_node_url: nodeUrl,
                    job_type: JOB_TYPES.PUBLISH_ALGO,
                    state: JOB_STATES.PROCESSING
                });
                let saveJob = await job.save();
                let data = {nodeUrl, args: ["publishAlgo", ddo, false], jobId: saveJob._id};
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