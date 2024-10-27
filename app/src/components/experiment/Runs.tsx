import { setSelectedRun } from "@/controller/experiment/experimentSlice";
import { useAppDispatch, useAppSelector } from "@/controller/hooks";
import { useDB } from "@/hooks/useDB";
import { headStyle } from "@/theme/layout";
import { SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Modal, Row, Select, Space, Table } from "antd";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";

export const Runs = () => {
    const dispatch = useAppDispatch();
    const { runs, selectedRun, experiment } = useAppSelector(state => state.experiment);
    const { searchRunByExperimentIDAction, deleteRunAction } = useAppSelector(state => state.process);
    const {createRun, deleteRunById} = useDB();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name"
        },
        {
            title: "Created at",
            dataIndex: "created_at",
            key: "created_at",
            render: (_, record) => (
                new Date(record.created_at).toLocaleString()
            )
        },
        {
            title: "State",
            dataIndex: "state",
            key: "state"
        },
        {
            title: "Actions",
            dataIndex: "action",
            key: "action",
            render: (_, record, index) => (
                <Space>
                    <Button type="default" onClick={() => {
                        dispatch(setSelectedRun(record));
                        showConfirmModal();
                    }}>Delete</Button>
                    <Button type="primary" onClick={() => router.push(`/experiment/run/${record._id}`)}>Details</Button>
                </Space>
            )
        },

    ]



    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const onFinishSearchForm = (values: FormData) => {
        // Filter feature at here
    }
    const onFinishNewRunForm = useCallback((values: FormData) => {
        createRun(values["name"], experiment).then(() => setIsModalOpen(false))
        
    },[experiment._id])
    
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

    const showConfirmModal = () => {
        setConfirmModalOpen(true);
    };

    const handleConfirmOk = useCallback(() => {
        deleteRunById(selectedRun).then(() => setConfirmModalOpen(false))
    }, [selectedRun]);

    const handleConfirmCancel = () => {
        setConfirmModalOpen(false);
    };
    return (
        <Card title="Expirement runs" headStyle={headStyle} extra={
            <Space>
                <Button type='primary' size="large" onClick={showModal}>New run</Button>
            </Space>

        }>
            <Form
                onFinish={onFinishSearchForm}
                initialValues={{
                    "time_created": 0,
                    "state": 1,
                    "sort_by": 1

                }}>
                <Row gutter={12}>
                    <Col span={7}>
                        <Form.Item name={"time_created"}>
                            <Select size="large" options={[
                                { label: "Time created", value: 0 },
                                { label: "Last hour", value: 1 },
                                { label: "Last 24 hours", value: 2 },
                                { label: "Last 7 days", value: 3 },
                                { label: "Last 30 days", value: 4 },
                                { label: "Last year", value: 5 },
                            ]} />
                        </Form.Item>
                    </Col>
                    <Col span={7}>
                        <Form.Item name={"state"}>
                            <Select size="large" options={[
                                { label: "State: created", value: "created" },
                                { label: "State: processing", value: "processing" },
                                { label: "State: finished", value: "finished" },
                                { label: "State: failed", value: "failed" },
                            ]} />
                        </Form.Item>
                    </Col>
                    <Col span={7}>
                        <Form.Item name={"sort_by"}>
                            <Select size="large" options={[
                                { label: "Sort: Created", value: 1 },
                            ]} />
                        </Form.Item>
                    </Col>
                    <Col span={3}>
                        <Button type="primary" htmlType="submit" size="large" icon={<SearchOutlined />}></Button>
                    </Col>
                </Row>
            </Form>
            <Table
                loading={searchRunByExperimentIDAction}
                columns={columns}
                dataSource={runs?.map(r => {
                    return {
                        name: r.name ?? "N/A",
                        created_at: r.created_at,
                        state: r.state,
                        _id: r._id,
                        experiment_id: r.experiment_id,
                        owner: r.owner
                    }
                })}
            />
            <Modal title="NEW RUN" open={isModalOpen} footer={[]} onCancel={handleCancel}>
                <Form onFinish={onFinishNewRunForm}>
                    <Form.Item name={"name"}>
                        <Input size="large" placeholder="Experiment Run Name"/>
                    </Form.Item>
                    <Form.Item>
                        <Button size="large" type="primary" htmlType="submit">Submit</Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal title="Do you want to delete this experiment run?" open={isConfirmModalOpen} footer={[]} onOk={() => handleConfirmOk()} onCancel={handleConfirmCancel}>
                <Space>
                    <Button type="primary" loading={deleteRunAction} onClick={() => handleConfirmOk()}>Yes</Button>
                    <Button type="default" onClick={() => handleConfirmCancel()}>No</Button>
                </Space>
            </Modal>
        </Card>

    )
}