import { useAppSelector } from "@/controller/hooks";
import { useDB } from "@/hooks/useDB";
import { Button, Card, Col, Descriptions, Divider, Flex, Row, Space, Table, Tag } from "antd";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Runs } from "./Runs";
import { GraphNodes } from "../graph/Nodes";

export const Detail = () => {
    const router = useRouter();
    const { searchRunsByExperimentId, getExperimentByCreatorAndId } = useDB();
    const { experiment, runs } = useAppSelector(state => state.experiment);
    useEffect(() => {
        if (router.query?.id) {
            searchRunsByExperimentId(router.query?.id?.toString());
            getExperimentByCreatorAndId(router.query?.id?.toString())
        }
    }, [router.query?.id]);


    return (
        <Card style={{ maxWidth: 1200, margin: '0 auto' }}>

            <Row gutter={12}>

                <Col span={10}>
                    <Card title={experiment.name} extra={
                        <Button type='primary' onClick={() => router.push(`/experiment/edit/${experiment._id}`)}>Edit</Button>
                    }>
                        <Descriptions column={1} layout="vertical">
                            <Descriptions.Item label="Description">
                                {experiment.description}
                            </Descriptions.Item>
                        </Descriptions>
                        <Divider />
                        <Descriptions column={2} layout="vertical">
                            <Descriptions.Item label="C2D environment">
                                Docker Engine
                            </Descriptions.Item>
                            {/* <Descriptions.Item label="Created at">
                                {new Date(experiment.created_at).toLocaleString()}
                            </Descriptions.Item> */}
                        </Descriptions>
                        <Divider />
                        <Descriptions layout='vertical' column={1}>
                            <Descriptions.Item label="Execution Orders">
                                <Flex justify='center' align='center'>
                                    {
                                        experiment.orders.map((order, index) => {
                                            let nodes = experiment.nodes.filter(node => order.indexOf(node.id) !== -1);
                                            return <Tag key={`tag-order-${index}`}> {nodes.map((node, idx) => {
                                                return <div key={`tag-order-div-${index}-${idx}`}>
                                                    {node.data.label}
                                                </div>
                                            })
                                            }
                                            </Tag>

                                        })
                                    }
                                </Flex>
                            </Descriptions.Item>

                        </Descriptions>
                    </Card>
                    <Divider />
                    <GraphNodes nodes={experiment.nodes} />
                </Col>
                <Col span={14}>
                    <Runs />
                </Col>
            </Row>

        </Card>
    )
}