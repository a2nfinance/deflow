import connect from '@/database/connect';
import { NextApiRequest, NextApiResponse } from 'next';
import Run, { RunStates } from "@/database/models/run";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // need to validate
        const {
            owner,
            _id,
            state
        } = req.body;
        if (owner && _id && state) {
            try {
                await Run.findOneAndUpdate({ owner: owner, _id: _id}, {state: state});
                res.json({ success: true });
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