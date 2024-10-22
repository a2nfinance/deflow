import connect from '@/database/connect';
import Job, { JOB_STATES, JOB_TYPES } from '@/database/models/job';
import { executeComputeGraphQueue } from '@/queue';
import { NextApiRequest, NextApiResponse } from 'next';
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // need to validate
        const {
            experimentId,
            runId
        } = req.body;
        if (experimentId && runId) {
            try {
                executeComputeGraphQueue.add(experimentId, runId);
                return res.status(200).send({success: true, message: "Starting computation graph"});
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