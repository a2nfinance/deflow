import { JOB_STATES } from "@/database/models/job"
import { Card, Descriptions } from "antd"
const stateColors = {
    "processing": "blue",
    "failed": "red",
    "finished": "green"
}
export const PublisAssetJobDesc = ({ job, node }) => {
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
            </Descriptions>
        </Card>
    )
}