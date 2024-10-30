import { AlgoForm } from "@/components/assets/AlgoForm";
import { DatasetForm } from "@/components/assets/DatasetForm";
import { NotConnectInfo } from "@/components/common/NotConnectInfo";
import { headStyle } from "@/theme/layout";
import { useConnectWallet } from "@web3-onboard/react";
import { Alert, Card, Divider } from "antd";

export default function PublishAssets() {
    const [{ wallet }] = useConnectWallet();
    return (
        !!wallet?.accounts?.length ? <div style={{ maxWidth: 500, margin: '0 auto' }}>
            <Alert type="info" message="These are simple forms for publishing datasets and algorithms to Ocean Nodes, for testing purposes only." icon={true} />
            <Divider />
            <Alert type="info" message="You should use the following two custom nodes for testing: http://35.240.143.195:8000 and http://35.247.146.39:8000." icon={true} />
            <Divider />
            <Card title="Publish Dataset" headStyle={headStyle}>
                <DatasetForm />
            </Card>
            <Divider />
            <Card title="Publish Algorithm" headStyle={headStyle}>
                <AlgoForm />
            </Card>
        </div> : <NotConnectInfo />
    )
}