import { getTopologicalOrdering } from "@/utils/getExecutionOrders";
import { AppstoreAddOutlined, PlusCircleFilled, PlusCircleOutlined } from "@ant-design/icons";
import {
  Background,
  ControlButton,
  Controls,
  ReactFlow,
  addEdge,
  getConnectedEdges,
  getIncomers,
  getOutgoers,
  reconnectEdge,
  useEdgesState,
  useNodesState
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button, Card, Col, Divider, Form, Input, Row, Steps } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { InputNodeForm } from "./InputNodeForm";
import { MiddleAndOutputForm } from "./MiddleAndOutputForm";
import { useDB } from "@/hooks/useDB";
import { useConnectWallet } from "@web3-onboard/react";
import { Experiment } from "@/controller/experiment/experimentSlice";
import { useRouter } from "next/router";
import { headStyle } from "@/theme/layout";

const initialXY = 0;

const initialNodes = [
  {
    id: '1',
    data: { label: 'Node 1' },
    position: { x: initialXY, y: initialXY },
    type: 'input',
  },
  {
    id: '2',
    data: { label: 'Output' },
    position: { x: initialXY, y: initialXY + 50 },
    type: "output"
  },
];

const initialEdges = [
  { id: '1-2', source: '1', target: '2' },
];

export const NodesGraph = ({ existEdges, existNodes, name, description }: { existEdges?: any[], existNodes?: any[], name?: string, description?: string }) => {
  const router = useRouter();
  const edgeReconnectSuccessful = useRef(true);
  const [nodes, setNodes, onNodesChange] = useNodesState(existNodes ?? initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(existEdges ?? initialEdges);
  const [selectedNode, setSelectedNode] = useState(existNodes ? existNodes[0] : initialNodes[0]);
  const { createExperiment, updateExperiment } = useDB();
  const [{ wallet }] = useConnectWallet();
  const addNewNode = useCallback((type: number) => {
    let nodeType = "";
    if (type === 2) nodeType = "input";
    if (type === 3) nodeType = "output";
    let newNode = {
      type: nodeType,
      id: `${nodes.length + 1}`,
      data: { label: `Node ${nodes.length + 1}` },
      position: { x: initialXY, y: nodes.length * 50 + initialXY }
    };
    // let edge = { id: '3-2', source: '3', target: '2', label: 'to the', type: 'step' };
    setNodes([...nodes, newNode]);
    // setEdges([...edges, edge]);
  }, [nodes, edges])

  const onConnect = useCallback(
    (params) => {

      setEdges((eds) => addEdge(params, eds));
    }, []
  );


  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect = useCallback((oldEdge, newConnection) => {
    edgeReconnectSuccessful.current = true;
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
  }, []);

  const onReconnectEnd = useCallback((_, edge) => {
    if (!edgeReconnectSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }

    edgeReconnectSuccessful.current = true;
  }, []);

  const onNodesDelete = useCallback(
    (deleted) => {
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);
          const connectedEdges = getConnectedEdges([node], edges);

          const remainingEdges = acc.filter(
            (edge) => !connectedEdges.includes(edge),
          );

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${target}`,
              source,
              target,
            })),
          );

          return [...remainingEdges, ...createdEdges];
        }, edges),
      );
    },
    [nodes, edges],
  );

  const onNodeClick = useCallback((_, object) => {
    setSelectedNode(object);
  }, [edges, nodes, selectedNode]);

  const onFinish = useCallback((values: FormData) => {
    let updateObject = {
      ocean_node_address:  values[`ocean_node_address_${selectedNode.id}`],
      label: values[`label_${selectedNode.id}`],
      algorithm_id: values[`algorithm_id_${selectedNode.id}`],
      compute_env_id: values[`compute_env_${selectedNode.id}`]
    }
    if (selectedNode.type === "input") {
      //@ts-ignore
      updateObject = {...updateObject, dataasset_id: values[`dataasset_id_${selectedNode.id}`]};
    }

    selectedNode.data = {...selectedNode.data, ...updateObject};

    setNodes(nodes => nodes.map((node, index) => {
      if (node.id === selectedNode.id) {
        return selectedNode;
      }
      return node;
    }))
  }, [selectedNode, nodes])

  const nodeFormComponent = (node) => {
    if (node)
      if (node.type === "input") {
        return <InputNodeForm onFinish={onFinish} node={node} />
      } else {
        return <MiddleAndOutputForm onFinish={onFinish} node={node} />
      }
  }

  const handleSubmitExperiment = useCallback((values) => {
    let orders = getTopologicalOrdering(edges);
    console.log("Nodes:", nodes);
    console.log("edges:", edges);
    const body = {
      owner: wallet?.accounts[0].address,
      name: values["name"],
      description: values["description"],
      nodes: nodes,
      edges: edges,
      orders: orders
    }
    if (name && description) {
      updateExperiment(body).then(() => router.push("/"));
    } else {
      createExperiment(body).then(() => router.push("/"));
    }
   
  }, [edges, nodes, name, description])


  const ordersComponent = (edgesArr, nodeArr) => {
    let orders = getTopologicalOrdering(edgesArr);

    let items = orders.map((nodesInOrder, index) => {
      let nodeLabels = nodesInOrder.map(nodeId => {
        return nodeArr.filter(node => node.id == nodeId)[0].data.label

      });
      return {
        title: `Layer ${index}`,
        description: `${nodeLabels.join(", ")}`
      }

    })

    return items;
  }
  return (
    <div style={{ width: "100%" }}>
      <Card size="small">

        <Steps
          direction="horizontal"
          items={ordersComponent(edges, nodes)}
        />

      </Card>
      <Divider />
      <Row gutter={12}>
        <Col span={16}>
          <Card title="Computation graph">
            <div style={{ height: 915, color: "black" }}>
              <ReactFlow
                nodes={nodes}
                onNodesChange={onNodesChange}
                edges={edges}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onReconnect={onReconnect}
                onReconnectStart={onReconnectStart}
                onReconnectEnd={onReconnectEnd}
                onNodesDelete={onNodesDelete}
                onNodeClick={onNodeClick}
                fitView
              >
                <Background />
                <Controls position="top-left">
                  <ControlButton name="New Node" title="Middle Node" onClick={() => addNewNode(1)}>
                    <AppstoreAddOutlined />
                  </ControlButton>
                  <ControlButton name="New Node" title="Input Node" onClick={() => addNewNode(2)}>
                    <PlusCircleFilled />
                  </ControlButton>
                  <ControlButton name="New Node" title="Output Node" onClick={() => addNewNode(3)}>
                    <PlusCircleOutlined />
                  </ControlButton>
                </Controls>
              </ReactFlow>
            </div>
          </Card>

        </Col>

        <Col span={8}>
          <Card title="Experiment settings">
            <Form layout="vertical" onFinish={handleSubmitExperiment} initialValues={{
              name: name,
              description: description
            }}>
              <Form.Item label={"Name"} name={"name"} rules={[{required: true, message: "Name is missing"}]}>
                <Input size="large" />
              </Form.Item>
              <Form.Item label={"Description"} name={"description"} rules={[{required: true, message: "Description is missing"}]}>
                <Input size="large" />
              </Form.Item>
              <Button size="large" htmlType="submit" type="primary" block>Save computation graph information</Button>
            </Form>
          </Card>
          <Divider />
          <Card title={selectedNode.data.label}>

              {
                nodeFormComponent(selectedNode)
              }
            </Card>
        </Col>
      </Row >


    </div>
  );
}