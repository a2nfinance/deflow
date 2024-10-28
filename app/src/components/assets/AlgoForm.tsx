import { useOceanNode } from "@/hooks/useOceanNode";
import { Button, Form, Input, message } from "antd"

export const AlgoForm = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const {publishAlgoAsset} = useOceanNode();
    const onFinish = (values: FormData) => {
        publishAlgoAsset(values).then(data => {
            if (data.success) {
                messageApi.success("Publishing algorithm asset is in progress. Please wait and check back later.")
            } else {
                messageApi.error("Publishing the algorithm asset has failed. Please check the submitted information and try again!")
            }
        })
    }
    return <Form onFinish={onFinish} layout="vertical">
        {contextHolder}
        <Form.Item label="Ocean Node address" name={"nodeUrl"} rules={[{required: true, message: "Ocean node address is missing", type: "url"}]}>
            <Input size="large" />
        </Form.Item>
        <Form.Item label="Asset URL" name={"assetUrl"} rules={[{required: true, message: "Asset URL is missing", type: "url"}]}>
            <Input size="large" />
        </Form.Item>
        <Form.Item label="Name" name={"name"} rules={[{required: true, message: "Name is missing"}]}>
            <Input size="large" />
        </Form.Item>
        <Form.Item label="Docker image" name={"image"} rules={[{required: true, message: "Docker image is missing"}]}>
            <Input size="large" />
        </Form.Item>
        <Form.Item label="Entrypoint" name={"entrypoint"} rules={[{required: true, message: "Entrypoint is missing"}]}>
            <Input size="large" />
        </Form.Item>
      
        <Form.Item label="Image tag" name={"tag"} rules={[{required: true, message: "Image tag is missing"}]}>
            <Input size="large" />
        </Form.Item>
        <Form.Item label="Checksum" name={"checksum"} rules={[{required: true, message: "Image checksum is missing"}]}>
            <Input size="large" />
        </Form.Item>
        <Button type="primary" size="large" htmlType="submit" block>Submit</Button>
    </Form>
}