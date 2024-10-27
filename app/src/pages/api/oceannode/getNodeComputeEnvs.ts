import connect from '@/database/connect';
import { getShortId } from '@/utils/nodeUtils';
import { NextApiRequest, NextApiResponse } from 'next';
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID!;
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // need to validate
        const {
            nodeUrl,
        } = req.body;
        if (nodeUrl) {
            try {
                
                let computeEnvsReq = await fetch(`${nodeUrl}/api/services/computeEnvironments?chainId=${chainId}`);
                let computeEnvsRes = await computeEnvsReq.json();
                let computeEnvs = computeEnvsRes[chainId].map((env) => {
                    return { label: getShortId(env.id), value: env.id}
                });
                return res.status(200).send({success: true, computeEnvs: computeEnvs});
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