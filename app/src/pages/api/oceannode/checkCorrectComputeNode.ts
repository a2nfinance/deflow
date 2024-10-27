import connect from '@/database/connect';
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
                let result = false;
                let getReq = await fetch(`${nodeUrl}`);
                let getRes = await getReq.json();
                if (getRes.chainIds.length && getRes.chainIds.indexOf(chainId) !== -1) {
                    result = true;
                }
                return res.status(200).send({ success: true, result: result });
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