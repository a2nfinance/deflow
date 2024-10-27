import { headStyle } from '@/theme/layout';
import { Button, Card, Descriptions, Divider, Flex, Space, Tag } from 'antd';
import { useRouter } from 'next/router';
export const Item = ({ index, experiment }: { index: number, experiment: any }) => {
  const router = useRouter();
  return (
    <Card key={`experiment-${index}`} title={experiment.name} headStyle={headStyle} style={{ margin: 5 }} extra={
      <Space>
        <Button type='primary' onClick={() => router.push(`/experiment/detail/${experiment._id}`)}>Details</Button>
      </Space>

    }>
      <Descriptions column={1} layout="vertical">
        <Descriptions.Item label="Description">
          {experiment.description}
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <Descriptions column={2} layout="vertical">
        <Descriptions.Item label="C2D environment">
          Docker Engine
        </Descriptions.Item>
        <Descriptions.Item label="Graph Nodes">
          {experiment.nodes.length}
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <Descriptions layout='vertical' column={1}>
        <Descriptions.Item label="Layers in the compute execution order">
          <Flex justify='center' align='center'>
            {
              experiment.orders.map((order, index) => {
                let nodes = experiment.nodes.filter(node => order.indexOf(node.id) !== -1);
                return <Tag key={`tag-order-${index}`}> {nodes.map((node, idx) => {
                  return <div key={`tag-order-div-${index}-${idx}`}>
                    {node.data.label}
                  </div>
                })
                }
                </Tag>

              })
            }
          </Flex>
        </Descriptions.Item>

      </Descriptions>
    </Card>
  );
}