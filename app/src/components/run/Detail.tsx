import { useAppSelector } from "@/controller/hooks";
import { JOB_STATES, JOB_TYPES } from "@/database/models/job";
import { useDB } from "@/hooks/useDB";
import { Background, Controls, ReactFlow } from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { Button, Card, Col, Divider, Row } from "antd";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { GraphNodes } from "../graph/Nodes";
import { ComputeJobDesc } from "./ComputeJobDesc";
import { PublisAssetJobDesc } from "./PublishAssetJobDesc";
import { useConnectWallet } from "@web3-onboard/react";

export const RunDetail = () => {
    const [{wallet}] = useConnectWallet();
    const router = useRouter();
    const { run, jobs } = useAppSelector(state => state.experiment);
    const { getRunById, getJobsByRunId } = useDB();


    useEffect(() => {
        if (router.query?.id) {
            getRunById(router.query?.id.toString());
            getJobsByRunId(router.query?.id.toString());
        }
    }, [router.query?.id, wallet?.accounts[0].address]);

    return (
        <Card style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Row gutter={12}>
                <Col span={10}>
                    <Card title={"Computation Flow"}>
                        <div style={{ height: '400px', color: "black" }}>
                            <ReactFlow
                                nodes={run.nodes}
                                // onNodesChange={onNodesChange}
                                edges={run.edges}
                                // onEdgesChange={onEdgesChange}
                                // onConnect={onConnect}
                                // onReconnect={onReconnect}
                                // onReconnectStart={onReconnectStart}
                                // onReconnectEnd={onReconnectEnd}
                                // onNodesDelete={onNodesDelete}
                                // onNodeClick={onNodeClick}
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
                    <Card title={"Progress history"}>

                        {
                            jobs.map((job, index) => {
                                let node = run.nodes.filter(n => n.id === job.graph_node_id)[0];
                                if (job.job_type === JOB_TYPES.PUBLISH_ASSET) {
                                    return <PublisAssetJobDesc key={`publish-asset-${index}`} node={node} job={job} />
                                } else if (job.job_type === JOB_TYPES.PUBLISH_COMPUTE) {
                                    if (job.state === JOB_STATES.FINISHED && node.type === "output") {
                                        return <>
                                            <Card title={"Computation graph has been executed successful!"}>
                                                <Button type={"primary"} size="large" block onClick={() => window.open(job.result.computedJob.outputsURL, "_blank")}>Download the Final Result Here</Button>
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