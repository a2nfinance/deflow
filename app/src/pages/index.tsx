import { NodesGraph } from "@/components/flow/NodesGraph";

export default function Index() {
    // const {initializeCompute, getComputeEnvironments} = useOcean();
    return (
        <>
            {/* <Button onClick={() => initializeCompute()}>Initialize Computes</Button>
            <Button onClick={() => getComputeEnvironments()}>Get compute environments</Button> */}
            <NodesGraph />
        </>
    )
}