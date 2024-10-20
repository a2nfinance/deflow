import { oceanConfig } from '@/configs/config';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
        try {
            let config = await oceanConfig();
            res.status(200).send(config);
        } catch (error) {
            console.log(error)
            return res.status(500).send(error.message);
        }
    } else {
        res.status(422).send('req_method_not_supported');
    }
};

export default handler;