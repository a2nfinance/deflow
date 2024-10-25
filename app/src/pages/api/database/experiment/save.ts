import connect from '@/database/connect';
import Experiment from "@/database/models/expirement";
import { NextApiRequest, NextApiResponse } from 'next';
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const {
            owner,
            name,
            description,
            nodes,
            edges,
            orders
        } = req.body;
        if (owner && nodes && edges && orders && name && description) {
            try {
                let experiment = new Experiment(req.body);
                let savedExperiment = await experiment.save();
                return res.status(200).send({ success: true, experimentId: savedExperiment._id });
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