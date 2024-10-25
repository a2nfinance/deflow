import connect from '@/database/connect';
import Run from "@/database/models/run";
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const {
            owner,
            _id
        } = req.body;
        if (owner && _id) {
        
            try {
                let runs = await  Run.find({experiment_id: _id}).sort({created_at: -1});
                return res.status(200).send(runs);
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