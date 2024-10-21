import { URL } from "url";
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID!;
export const useOceanNode = () => {
    const checkCorrectNode = async (nodeUrl: URL) => {
        let req = await fetch(`${nodeUrl}`);
        let res = await req.json();
        if (res.chainIds.length && res.chainIds.indexOf(chainId) !== -1) {
            return true;
        }
        return false;
    }
    const getComputeEnvs = async (nodeUrl: URL) => {
        let computeEnvsReq = await fetch(`${nodeUrl}/api/services/computeEnvironments?chainId=${chainId}`);
        let computeEnvsRes = await computeEnvsReq.json();
        let computeEnvs = computeEnvsRes[chainId].map((env) => {
            return { label: env.id, value: env.id }
        });

        return computeEnvs;

    };

    const getDDOs = async (url: URL) => {
        try {
            let typesenseUrl = `${url.protocol}//${url.hostname}:8108`;
            let ddosReq = await fetch(`${typesenseUrl}/collections/op_ddo_v4.1.0/documents/search?q=*&filter_by=chainId:=${chainId}`, {
                method: "GET",
                headers: {
                    "X-TYPESENSE-API-KEY": "xyz"
                }
            });
            let ddosRes: any = await ddosReq.json();
            if (ddosRes.hits && ddosRes.hits.length) {
                let algoAssets = ddosRes.hits.filter(hit => hit.document.metadata.type === "algorithm");
                let dataAssets = ddosRes.hits.filter(hit => hit.document.metadata.type === "dataset");
                let algos: { label: string, value: string }[] = algoAssets.map(hit => ({ label: hit.document.metadata.name, value: hit.document.id }));
                let datasets: { label: string, value: string }[] = dataAssets.map(hit => ({ label: hit.document.metadata.name, value: hit.document.id }));
                return {
                    algos,
                    datasets
                }
            }

        } catch (e) {
            console.log(e);
        }
        return {
            algos: [],
            datasets: []
        }
    }

    return { checkCorrectNode, getComputeEnvs, getDDOs };
};