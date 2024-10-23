import connect from '@/database/connect';
import { executeComputeGraphQueue } from '@/queue';
import { NextApiRequest, NextApiResponse } from 'next';
import Run from "@/database/models/run";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const {
            runId
        } = req.body;
        if (runId) {
            try {
                let run = await Run.findById(runId);
                executeComputeGraphQueue.add({run: run});
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