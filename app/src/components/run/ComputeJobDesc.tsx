import { JOB_STATES } from "@/database/models/job"
import { LinkOutlined } from "@ant-design/icons"
import { Button, Card, Descriptions, Space } from "antd"
const stateColors = {
    "processing": "blue",
    "failed": "red",
    "finished": "green"
}
export const ComputeJobDesc = ({ job, node }) => {
    return (
        <Card style={{ marginBottom: "10px", backgroundColor: stateColors[job.state] }} className={job.state === JOB_STATES.PROCESSING ? "in-progress" : ""}>
            
            <Descriptions layout="vertical" column={3}>
                <Descriptions.Item label={"Node"}>
                    {node?.data?.label}
                </Descriptions.Item>
                <Descriptions.Item label={"Job type"}>
                    {job.job_type}
                </Descriptions.Item>
                <Descriptions.Item label={"State"}>
                    {job.state}
                </Descriptions.Item>
                <Descriptions.Item label={"Algo File"}>
                    <Button icon={<LinkOutlined />} onClick={() => window.open(job.result?.computedJob?.algorithm?.fileObject?.url, "_blank")}></Button>
                </Descriptions.Item>
                <Descriptions.Item label={"Asset File"}>
                    <Space>
                        {
                            job.result?.computedJob?.assets?.map(asset => {

                                return <Button icon={<LinkOutlined />} onClick={() => window.open(asset.fileObject.url, "_blank")}></Button>
                            })
                        }
                        
                    </Space>

                </Descriptions.Item>
            </Descriptions>
        </Card>
    )
}