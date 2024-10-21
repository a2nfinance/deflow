import { useOceanNode } from "@/hooks/useOceanNode";
import { Button, Form, Input, Select } from "antd"
import { useCallback, useState } from "react"

export const InputNodeForm = ({ onFinish, node }: { onFinish: (values: any) => void, node: any }) => {
    const [assets, setAssets] = useState<{label: string, value: string}[]>([]);
    const [algos, setAlgos] = useState<{label: string, value: string}[]>([]);
    const [computeEnvs, setComputeEnvs] = useState<{label: string, value: string}[]>([]);
    const {getComputeEnvs, checkCorrectNode, getDDOs} = useOceanNode();
    const handleOnchange = useCallback(async (e) => {
        let url: URL;
        try {
            url = new URL(e.target.value);
            let isCorrectNode = await checkCorrectNode(e.target.value);
            if (!isCorrectNode) return;
            let envs = await getComputeEnvs(e.target.value);
            let {algos, datasets} = await getDDOs(url);
            setComputeEnvs(envs);
            setAlgos(algos);
            setAssets(datasets);
        } catch(error) {
            return;
        }
    }, [assets, algos, computeEnvs])
    return <Form name={`form-${node.id}`} layout="vertical" onFinish={onFinish} initialValues={{
        "label": node.data.label,
        "ocean_node_address": node.data.ocean_node_address,
        "ddo_ids": node.data.ddo_ids,
    }}>
        <Form.Item name={`label_${node.id}`} label="Label">
            <Input size="large" placeholder="Label" />
        </Form.Item>
        <Form.Item name={`ocean_node_address_${node.id}`} label="Ocean Node Address" rules={[{required: true, message: "Ocean node is missing", type: "url"}]}>
            <Input size="large" placeholder="Ocean Node Address" onChange={(e) => handleOnchange(e)}/>
        </Form.Item>
        <Form.Item name={`algorithm_ddo_id_${node.id}`} label="Algorithm DDO ID" rules={[{required: true, message: "Algorithm is missing"}]}>
            <Select size="large" options={algos} />
        </Form.Item>
        <Form.Item name={`asset_ddo_id_${node.id}`} label="Asset DDO ID" rules={[{required: true, message: "Dataset is missing"}]}>
            <Select size="large" options={assets} />
        </Form.Item>
        <Form.Item name={`compute_env_${node.id}`} label="Compute ENV">
            <Select size="large" options={computeEnvs} />
        </Form.Item>
        <Form.Item>
            <Button size="large" block type="primary" htmlType="submit">Update</Button>
        </Form.Item>
    </Form>
}