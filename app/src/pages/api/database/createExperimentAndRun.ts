import connect from '@/database/connect';
import Experiment from "@/database/models/expirement";
import Run from "@/database/models/run";
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
        if (nodes && edges && orders && name && description) {
            try {
                let experiment = new Experiment(req.body);
                let savedExperiment = await experiment.save();
                // Create a run here
                let run = new Run({
                    owner: owner,
                    experiment_id: savedExperiment._id,
                    nodes: nodes,
                    edges: edges,
                    orders: orders
                })
                let savedRun = await run.save();
                return res.status(200).send({ success: true, experimentId: savedExperiment._id, runId: savedRun._id });
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