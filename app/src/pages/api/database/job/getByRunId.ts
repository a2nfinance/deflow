import connect from '@/database/connect';
import Job from "@/database/models/job";
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const {
            owner,
            run_id
        } = req.body;
        if (owner && run_id) {
        
            try {
                let jobs = await  Job.find({run_id: run_id}).sort({created_at: -1});
                return res.status(200).send(jobs);
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