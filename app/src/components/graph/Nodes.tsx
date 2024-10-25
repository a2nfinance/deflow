import { Card, Table } from "antd"

export const GraphNodes = ({nodes}) => {
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        
        {
            title: "Ocean Node",
            dataIndex: "ocean_node_address",
            key: "ocean_node_address"
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type"
        },
    ]
    return <Card title={"Graph Nodes"}>
    <Table pagination={false} dataSource={nodes.map((node) => {
        return {
            name: node.data.label,
            ocean_node_address: node.data.ocean_node_address,
            type: node.type ? node.type : "middle"
        }
    })} columns={columns} />
</Card>
}