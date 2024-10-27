import connect from '@/database/connect';
import { NextApiRequest, NextApiResponse } from 'next';
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID!;
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // need to validate
        const {
            typesenseUrl,

        } = req.body;
        if (typesenseUrl) {
            try {
                let algos: { label: string, value: string }[] = [];
                let datasets: { label: string, value: string }[] = [];
                let ddosReq = await fetch(`${typesenseUrl}/collections/op_ddo_v4.1.0/documents/search?q=*&per_page=40&filter_by=chainId:=${chainId}`, {
                    method: "GET",
                    headers: {
                        "X-TYPESENSE-API-KEY": "xyz"
                    }
                });
                let ddosRes: any = await ddosReq.json();
                if (ddosRes.hits && ddosRes.hits.length) {
                    let algoAssets = ddosRes.hits.filter(hit => hit.document.metadata.type === "algorithm");
                    let dataAssets = ddosRes.hits.filter(hit => hit.document.metadata.type === "dataset");
                    algos = algoAssets.map(hit => ({ label: hit.document.metadata.name, value: hit.document.id }));
                    datasets = dataAssets.map(hit => ({ label: hit.document.metadata.name, value: hit.document.id }));
                }
                return res.status(200).send({ success: true, algos: algos, datasets: datasets });
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