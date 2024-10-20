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
import { useCallback, useRef, useState } from 'react';

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

export const NodesGraph = () => {
  const edgeReconnectSuccessful = useRef(true);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(initialNodes[0]);
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
    // setEdges((edges) => {
    //   edges.forEach((el) => {
    //     if (object.id === el.source) {
    //       //@ts-ignore
    //       el.animated = true;
    //       //@ts-ignore
    //       el.selected = true;
    //       console.log("Set true:", el);

    //     } else {
    //       //@ts-ignore
    //       el.animated = false;
    //       //@ts-ignore
    //       el.selected = false;
    //       console.log("Set false:", el);
    //     }
    //   });
    //   return [...edges]
    // })
    console.log(nodes);
    let orders = getTopologicalOrdering(edges);
    console.log(orders);
    setSelectedNode(object);
  }, [edges, nodes, selectedNode]);

  const onFinish = useCallback((values: FormData) => {
    //@ts-ignore
    selectedNode.data.ocean_node_address = values[`ocean_node_address_${selectedNode.id}`]
    selectedNode.data.label = values[`label_${selectedNode.id}`]
    if (values["ddo_ids"]) {
      //@ts-ignore
      selectedNode.data.ddoIds = values[`ddo_ids_${selectedNode.id}`];
    }
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
        return <Form name={`form-${node.id}`} layout="vertical" onFinish={onFinish} initialValues={{
          "label": node.data.label,
          "ocean_node_address": node.data.ocean_node_address,
          "ddo_ids": node.data.ddo_ids,
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
          <Form.Item name={`asset_ddo_id_${node.id}`} label="Asset DDO ID">
            <Input size="large" placeholder="Asset DDO id" />
          </Form.Item>
          <Form.Item name={`compute_env_${node.id}`} label="Compute ENV">
            <Input size="large" placeholder="Compute environment" />
          </Form.Item>
          <Form.Item>
            <Button size="large" block type="primary" htmlType="submit">Update</Button>
          </Form.Item>
        </Form>
      } else {
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
  }


  const ordersComponent = (edgesArr, nodeArr) => {
    let orders = getTopologicalOrdering(edgesArr);

    let items = orders.map((nodesInOrder, index) => {
      let nodeLabels = nodesInOrder.map(nodeId => {
        return nodeArr.filter(node => node.id == nodeId)[0].data.label

      });
      return {
        title: `Group ${index}`,
        description: `Nodes: ${nodeLabels}`
      }

    })

    return items;
  }


  return (
    <div style={{ width: "100%" }}>
      <Card title={"Execution Order"} size="small">

        <Steps
          direction="horizontal"
          current={1}
          items={ordersComponent(edges, nodes)}
        />

      </Card>
      <Divider />
      <Row gutter={6}>
        <Col span={18}>
          <div style={{ height: '100vh', color: "black" }}>
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
        </Col>
        
        <Col span={6}>
          <Card title="Experiment settings" size="small">
             <Form layout="vertical">
                <Form.Item label={"Name"} name={"name"}>
                  <Input size="large" />
                </Form.Item>
                <Form.Item label={"Description"} name={"description"}>
                  <Input size="large" />
                </Form.Item>
             </Form>
          </Card>
          <Divider />
          <Card title={selectedNode.data.label} size="small">

            {
              nodeFormComponent(selectedNode)
            }
          </Card>
        </Col>
      </Row >


    </div>
  );
}