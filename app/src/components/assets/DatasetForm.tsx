import { useOceanNode } from "@/hooks/useOceanNode";
import { Button, Form, Input, message } from "antd"

export const DatasetForm = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const {publishDataAsset} = useOceanNode();
    const onFinish = (values: FormData) => {
        publishDataAsset(values).then(data => {
            if (data.success) {
                messageApi.success("Publishing dataset is in progress. Please wait and check back later.")
            } else {
                messageApi.error("Publishing the dataset has failed. Please check the submitted information and try again!")
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
        <Button type="primary" size="large" htmlType="submit" block>Submit</Button>
    </Form>
}