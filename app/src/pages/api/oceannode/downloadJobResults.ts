import connect from '@/database/connect';
import { start } from "@/oceancli/index";
import { downloadAndPublishQueue } from '@/queue';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // need to validate
        const {
            nodeUrl,
            // OceanNodeJobId: "${c2d_id_without_'-free'}-${nodeJobId}"
            envIdAndJobId,
            index,
            path,
            destinationNodeUrl
        } = req.body;
        if (nodeUrl && envIdAndJobId) {
            try {
                
                downloadAndPublishQueue.add({nodeUrl: nodeUrl, args: ["downloadJobResults", envIdAndJobId, index, path], destinationNodeUrl})
                // if (result.success) {
                //     res.status(200).send(result);
                // } else {
                //     res.status(422).send(result);
                // }
                res.status(200).send({success: true, jobId: 11});
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