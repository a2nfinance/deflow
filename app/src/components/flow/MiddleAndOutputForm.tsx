import { Button, Form, Input } from "antd"

export const MiddleAndOutputForm = ({onFinish, node}: {onFinish: (values: any) => void, node: any}) => {
    return <Form layout="vertical" onFinish={onFinish} initialValues={{
        "label": node.data.label,
        "ocean_node_address": node.data.ocean_node_address
      }}>
        <Form.Item name={`label_${node.id}`} label="Label">
          <Input size="large" placeholder="Label" />
        </Form.Item>
        <Form.Item name={`ocean_node_address_${node.id}`} label="Ocean Node Address">
          <Input size="large" placeholder="Ocean Node Address" />
        </Form.Item>
        <Form.Item name={`algorithm_ddo_id_${node.id}`} label="Algorithm DDO ID">
          <Input size="large" placeholder="Algorithm DDO ID" />
        </Form.Item>
        <Form.Item name={`compute_env_${node.id}`} label="Compute ENV">
          <Input size="large" placeholder="Compute environment" />
        </Form.Item>
        <Form.Item>
          <Button size="large" block type="primary" htmlType="submit">Update</Button>
        </Form.Item>
      </Form>
}