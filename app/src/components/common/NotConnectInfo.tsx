import React from 'react';
import { Card } from 'antd';

const { Meta } = Card;

export const NotConnectInfo = () => (
  <Card
    hoverable
    style={{ width: 550, margin: "0 auto" }}
    cover={<img alt="example" src="/computation_graph.webp" />}
  >
    <Meta style={{textAlign: "center"}} title="Wallet Not Connected" description="Please connect your wallet to view your created experiments, create runs, and start computation processes with your Ocean Nodes." />
  </Card>
);

