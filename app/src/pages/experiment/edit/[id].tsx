import { NodesGraph } from "@/components/flow/NodesGraph";
import { useAppSelector } from "@/controller/hooks";
import { useDB } from "@/hooks/useDB";
import { removeMeasuredField } from "@/utils/nodeUtils";
import { useConnectWallet } from "@web3-onboard/react";
import { Spin } from "antd";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function EditExperiment() {
    const [{wallet}] = useConnectWallet();
    const {getExperimentByCreatorAndId} = useDB();
    const {experiment} = useAppSelector(state => state.experiment);
    const router = useRouter();
    

    useEffect(() => {
        if (router.query?.id) {
            console.log("Get Experiment")
            getExperimentByCreatorAndId(router.query?.id.toString())
        }
    }, [router.query?.id, wallet?.accounts[0].address])

    return (
        experiment.nodes.length > 0 ? <NodesGraph name={experiment.name} description={experiment.description} existNodes={removeMeasuredField(experiment.nodes)} existEdges={experiment.edges} /> : <Spin />
    )
}