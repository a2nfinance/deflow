import { URL } from "url";
export const useOceanNode = () => {
    const checkCorrectNode = async (nodeUrl: string) => {
        let correctReq = await fetch(`/api/oceannode/checkCorrectComputeNode`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ nodeUrl: nodeUrl })
        });
        let correctRes = await correctReq.json();
        if (correctRes.success) {
            return correctRes.result;
        }
        return false;
    }
    const getComputeEnvs = async (nodeUrl: string) => {
        try {
            let envsReq = await fetch(`/api/oceannode/getNodeComputeEnvs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ nodeUrl: nodeUrl })
            });

            let envsRes = await envsReq.json();
            if (envsRes.success) {
                return envsRes.computeEnvs;
            }
        } catch(e) {
            console.log(e);
        }

        return [];

    };

    const getDDOs = async (url: URL) => {
        try {
            let typesenseUrl = `${url.protocol}//${url.hostname}:8108`;
            let ddosReq = await fetch(`/api/oceannode/getNodeDDOs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ typesenseUrl: typesenseUrl })
            });
            
            let ddoRes = await ddosReq.json();
            if (ddoRes.success) {
                return {
                    algos: ddoRes.algos,
                    datasets: ddoRes.datasets
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