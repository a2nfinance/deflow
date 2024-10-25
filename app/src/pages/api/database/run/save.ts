import connect from '@/database/connect';
import Run from "@/database/models/run";
import { NextApiRequest, NextApiResponse } from 'next';
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const {
            owner,
            name,
            experiment_id,
            nodes,
            edges,
            orders
        } = req.body;
        if (owner && nodes && edges && orders && name && experiment_id) {
            try {
                let run = new Run(req.body);
                let savedRun = await run.save();
                return res.status(200).send({ success: true, runId: savedRun._id });
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