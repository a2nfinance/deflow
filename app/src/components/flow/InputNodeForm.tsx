import { useOceanNode } from "@/hooks/useOceanNode";
import { Button, Form, Input, Select } from "antd";
import { useCallback, useEffect, useState } from "react";

export const InputNodeForm = ({ onFinish, node }: { onFinish: (values: any) => void, node: any }) => {
    const [assets, setAssets] = useState<{ label: string, value: string }[]>([]);
    const [algos, setAlgos] = useState<{ label: string, value: string }[]>([]);
    const [computeEnvs, setComputeEnvs] = useState<{ label: string, value: string }[]>([]);
    const { getComputeEnvs, checkCorrectNode, getDDOs } = useOceanNode();
    async function fetchData(nodeUrl: string) {
        let url: URL;
        try {
            url = new URL(nodeUrl);
            let isCorrectNode = await checkCorrectNode(nodeUrl);
            if (!isCorrectNode) return;
            let envs = await getComputeEnvs(nodeUrl);
            let { algos, datasets } = await getDDOs(url);
            setComputeEnvs(envs);
            setAlgos(algos);
            setAssets(datasets);
        } catch (error) {
            return;
        }
    }
    const handleOnchange = useCallback(async (e) => {
        fetchData(e.target.value)
    }, [assets, algos, computeEnvs])
    useEffect(() => {
        if (node.data.ocean_node_address) {
            fetchData(node.data.ocean_node_address);
        }
    }, [assets, algos, computeEnvs])
    return <Form name={`form-${node.id}`} layout="vertical" onFinish={onFinish} >
        <Form.Item name={`label_${node.id}`} label="Label" initialValue={node.data.label} rules={[{ required: true, message: "Label is missing" }]}>
            <Input size="large" placeholder="Label" />
        </Form.Item>
        <Form.Item name={`ocean_node_address_${node.id}`} initialValue={node.data.ocean_node_address} label="Ocean Node Address" rules={[{ required: true, message: "Ocean node is missing", type: "url" }]}>
            <Input size="large" placeholder="Ocean Node Address" onChange={(e) => handleOnchange(e)} />
        </Form.Item>
        <Form.Item name={`algorithm_id_${node.id}`} initialValue={node.data.algorithm_id} label="Algorithm DDO ID" rules={[{ required: true, message: "Algorithm is missing" }]}>
            <Select size="large" options={algos} />
        </Form.Item>
        <Form.Item name={`dataasset_id_${node.id}`} initialValue={node.data.dataasset_id} label="Asset DDO ID" rules={[{ required: true, message: "Dataset is missing" }]}>
            <Select size="large" options={assets} />
        </Form.Item>
        <Form.Item name={`compute_env_${node.id}`} initialValue={node.data.compute_env_id} label="Compute ENV" rules={[{ required: true, message: "ENV is missing" }]}>
            <Select size="large" options={computeEnvs} />
        </Form.Item>
        <Form.Item>
            <Button size="large" block type="primary" htmlType="submit">Update selected node</Button>
        </Form.Item>
    </Form>
}