import {
    GithubOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined
} from '@ant-design/icons';
import { Button, Form, Image, Layout, Menu, Space, theme } from 'antd';
import { useRouter } from 'next/router';
import React, { useState } from "react";
import { AiOutlineExperiment, AiTwotoneExperiment } from "react-icons/ai";
import { CiPlay1 } from "react-icons/ci";
import { FaSuperscript } from "react-icons/fa";
import { GrDeploy } from "react-icons/gr";
import { LuBrainCircuit } from "react-icons/lu";
import { ConnectWallet } from './common/ConnectWallet';
const { Header, Sider, Content, Footer } = Layout;

interface Props {
    children: React.ReactNode | React.ReactNode[];
}

export const LayoutProvider = (props: Props) => {
    const [collapsed, setCollapsed] = useState(true);
    const router = useRouter();
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider width={250} onCollapse={() => setCollapsed(!collapsed)} collapsed={collapsed} style={{ background: colorBgContainer }}>
                <div style={{ height: 50, margin: 16 }}>
                    {
                        !collapsed ? <Image src={"/logo.png"} alt="DeTrain" preview={false} width={190} /> : <Image src={"/icon.png"} alt="DeTrain" preview={false} width={50} height={50} />
                    }
                </div>

                <Menu
                    style={{ fontWeight: 600 }}
                    inlineIndent={10}
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    items={[
                        {
                            key: '2',
                            icon: <AiTwotoneExperiment />,
                            label: "My experiments",
                            onClick: () => router.push("/")
                        },
                        {
                            key: '3',
                            icon: <AiOutlineExperiment />,
                            label: "New experiment",
                            onClick: () => router.push("/experiment/new")
                        },
                        {
                            key: '4',
                            icon: <LuBrainCircuit />,
                            label: "Publish assets",
                            onClick: () => router.push("/asset/publish")
                        },
                        { type: "divider" },
                        {
                            key: "7",
                            type: "group",
                            label: !collapsed ? 'DeFlow v1.0.0' : "",
                            children: [
                                {
                                    key: '7.1',
                                    icon: <FaSuperscript />,
                                    label: 'Twitter',
                                    onClick: () => window.open("https://twitter.com/DeFlowA2N", "_blank")
                                },
                                {
                                    key: '7.2',
                                    icon: <GithubOutlined />,
                                    label: 'Github',
                                    onClick: () => window.open("https://github.com/a2nfinance/deflow", "_blank")
                                },
                            ]
                        },

                    ]}
                />
            </Sider>
            <Layout>

                <Header //@ts-ignore
                    style={{ padding: 0, backgroundColor: colorBgContainer }}>
                    <Space align="center" style={{ display: "flex", justifyContent: "space-between" }}>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{
                                fontSize: '16px',
                                width: 64,
                                height: 64,
                            }}
                        />
                        <Form layout="inline">
                            <Form.Item>

                                <ConnectWallet />
                            </Form.Item>
                        </Form>
                    </Space>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px 0 16px',
                        padding: 16,
                        boxSizing: "border-box",
                        width: "100%",
                        // background: colorBgContainer,
                        maxWidth: 1440,
                        marginRight: "auto",
                        marginLeft: "auto"
                    }}
                >
                    {props.children}
                </Content>
                <Footer style={{ textAlign: 'center', maxHeight: 50 }}>DeFlow ©2024 Created by A2N Finance</Footer>
            </Layout>

        </Layout>
    )

}
