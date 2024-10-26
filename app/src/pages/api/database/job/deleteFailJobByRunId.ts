import connect from '@/database/connect';
import Job, { JOB_STATES } from "@/database/models/job";
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const {
            owner,
            run_id
        } = req.body;
        if (owner && run_id) {
        
            try {
                await  Job.deleteMany({run_id: run_id, state: JOB_STATES.FAILED})
                return res.status(200).send({success: true});
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