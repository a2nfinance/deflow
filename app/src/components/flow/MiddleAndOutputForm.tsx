import { useOceanNode } from "@/hooks/useOceanNode";
import { Button, Form, Input, Select } from "antd";
import { useCallback, useEffect, useState } from "react";

export const MiddleAndOutputForm = ({ onFinish, node }: { onFinish: (values: any) => void, node: any }) => {
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
      let { algos } = await getDDOs(url);
      setComputeEnvs(envs);
      setAlgos(algos);
    } catch (error) {
      return;
    }
  }
  const handleOnchange = useCallback(async (e) => {
    fetchData(e.target.value)
  }, [algos, computeEnvs])
  useEffect(() => {
    if (node.data.ocean_node_address) {
      fetchData(node.data.ocean_node_address);
    }
  }, [algos, computeEnvs])
  return <Form layout="vertical" onFinish={onFinish}>
    <Form.Item name={`label_${node.id}`} label="Label" initialValue={node.data.label}>
      <Input size="large" placeholder="Label" />
    </Form.Item>
    <Form.Item name={`ocean_node_address_${node.id}`} initialValue={node.data.ocean_node_address} label="Ocean Node Address" rules={[{ required: true, message: "Ocean node is missing", type: "url" }]}>
      <Input size="large" placeholder="Ocean Node Address" onChange={(e) => handleOnchange(e)} />
    </Form.Item>
    <Form.Item name={`algorithm_id_${node.id}`} initialValue={node.data.algorithm_id} label="Algorithm DDO ID" rules={[{ required: true, message: "Algorithm is missing" }]}>
      <Select size="large" options={algos} />
    </Form.Item>
    <Form.Item name={`compute_env_${node.id}`} initialValue={node.data.compute_env_id} label="Compute ENV">
      <Select size="large" options={computeEnvs} />
    </Form.Item>
    <Form.Item help={"Result filename will be used to publish an DDO asset"} name={`output_filename_${node.id}`} initialValue={node.data.output_filename} label={"Output file name"}>
            <Input size="large" placeholder="E.g. people.txt, token_history.arff" />
        </Form.Item>
    <Form.Item>
      <Button size="large" block type="primary" htmlType="submit">Update</Button>
    </Form.Item>
  </Form>
}