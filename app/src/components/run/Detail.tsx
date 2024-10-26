import { useAppSelector } from "@/controller/hooks";
import { JOB_STATES, JOB_TYPES } from "@/database/models/job";
import { useDB } from "@/hooks/useDB";
import { useConnectWallet } from "@web3-onboard/react";
import { Background, Controls, ReactFlow } from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { Button, Card, Col, Divider, Row, Space } from "antd";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";
import { GraphNodes } from "../graph/Nodes";
import { ComputeJobDesc } from "./ComputeJobDesc";
import { PublisAssetJobDesc } from "./PublishAssetJobDesc";
import { RunStates } from "@/database/models/run";
import { ProcessingTimeComponent } from "../common/ProcessingTimeComponent";

export const RunDetail = () => {
    const [{ wallet }] = useConnectWallet();
    const router = useRouter();
    const { run, jobs } = useAppSelector(state => state.experiment);
    const { getRunById, getJobsByRunId, startComputeGraph, removeFailJobsAndStart } = useDB();



    useEffect(() => {
        if (router.query?.id) {
            let id = router.query?.id;
            getRunById(id.toString());
            getJobsByRunId(id.toString());

            let getJobsByInterval = setInterval(function () {
                console.log("Updating jobs...")
                getJobsByRunId(id.toString());

            }, 5000)

            return () => clearInterval(getJobsByInterval);
        }
    }, [router.query?.id, wallet?.accounts[0].address]);


    const handleStartNow = useCallback(() => {
        if (router.query?.id) {
            startComputeGraph(router.query?.id.toString());
        }
    }, [router.query?.id])


    const handleRemoveAndStart = useCallback(() => {
        if (router.query?.id) {
            removeFailJobsAndStart(router.query?.id.toString());
        }
    }, [router.query?.id])

    return (
        <Card style={{ maxWidth: 1200, margin: '0 auto' }} >
            <Row gutter={12}>
                <Col span={10}>
                    <Card title={"Computation Graph"} extra={
                        <Space>
                            {!jobs.length && <Button type='primary' size="large" loading={run.state === RunStates.PROCESSING} onClick={() => handleStartNow()}>Start now</Button>}
                            {!!jobs.length && run.state !== JOB_STATES.FAILED && <Button type='primary' size="large" disabled>Start now</Button>}
                            {!!jobs.length && run.state === JOB_STATES.FAILED && <Button type='primary' size="large" loading={run.state === RunStates.PROCESSING} onClick={() => handleRemoveAndStart()}>Remove Failed Jobs and Start</Button>}
                        </Space>

                    }>
                        <div style={{ height: '400px', color: "black" }}>
                            <ReactFlow
                                nodes={run.nodes}
                                edges={run.edges}
                                fitView
                            >
                                <Background />
                                <Controls position="top-left" />

                            </ReactFlow>
                        </div>
                    </Card>
                    <Divider />
                    <GraphNodes nodes={run.nodes} />
                </Col>
                <Col span={12}>
                    <Card title={"Progress history"} style={{ minHeight: "505px" }} extra={
                        <ProcessingTimeComponent run={run} />
                    }>

                        {
                            jobs.map((job, index) => {
                                let node = run.nodes.filter(n => n.id === job.graph_node_id)[0];
                                if (job.job_type === JOB_TYPES.PUBLISH_ASSET) {
                                    return <PublisAssetJobDesc key={`publish-asset-${index}`} node={node} job={job} />
                                } else if (job.job_type === JOB_TYPES.PUBLISH_COMPUTE) {
                                    if (job.state === JOB_STATES.FINISHED && node?.type === "output") {
                                        return <>
                                            <Card key={`result-${index}`} title={"Computation graph has been executed successful!"}>
                                                <Button type={"primary"} size="large" block onClick={() => window.open(job?.result?.computedJob?.outputsURL, "_blank")}>Download the Final Result Here</Button>
                                            </Card>
                                            <Divider />
                                            <ComputeJobDesc key={`start-compute-${index}`} node={node} job={job} />
                                        </>
                                    }
                                    return <ComputeJobDesc key={`start-compute-${index}`} node={node} job={job} />
                                } else {
                                    return <></>
                                }
                            })
                        }


                    </Card>
                </Col>
            </Row>
        </Card>
    )
}