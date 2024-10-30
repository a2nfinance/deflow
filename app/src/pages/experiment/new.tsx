import { NotConnectInfo } from "@/components/common/NotConnectInfo";
import { NodesGraph } from "@/components/flow/NodesGraph";
import { useConnectWallet } from "@web3-onboard/react";

export default function NewExperiment() {
    const [{wallet}] = useConnectWallet();
    return (
        !!wallet?.accounts?.length ? <NodesGraph /> : <NotConnectInfo /> 
    )
}