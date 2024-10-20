import connect from '@/database/connect';
import { NextApiRequest, NextApiResponse } from 'next';
import {start} from "@/oceancli/index";
import simpleComputeDataset from "@/oceancli/metadata/simpleComputeDataset.json";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // need to validate
        const {
            nodeUrl,
            assetUrl,
            name
        } = req.body;
        if (nodeUrl && assetUrl && name) {
            try {
                let ddo = {
                    ...simpleComputeDataset,
                    name: name,
                }
                ddo.services[0].files[0].url = assetUrl;
                console.log(ddo);
                // await start(
                //     nodeUrl,
                //     [
                //         ddo,
                //         false
                //     ]

                // )
                return res.status(200).send("success");
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