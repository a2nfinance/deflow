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
                let currentRun = await Run.findById(_id);
                if (!currentRun || currentRun.state === RunStates.FINISHED) return res.json({ success: false });
                let updateObject: any = {
                    state: state
                };
                if (state === RunStates.PROCESSING) {
                    if (currentRun.state === RunStates.CREATED) {
                        updateObject = {...updateObject, time_started: new Date()}
                    } else if (currentRun.state === RunStates.FAILED) {
                        updateObject = {...updateObject, time_ended: null};
                    }
                } 
                if (state === RunStates.FAILED || state === RunStates.FINISHED) {
                    updateObject = {...updateObject, time_ended: new Date()}
                }
                await Run.findOneAndUpdate({ owner: owner, _id: _id}, updateObject);
                return res.json({ success: true });
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