
import { DisconnectOutlined, WalletFilled } from "@ant-design/icons";
import { useConnectWallet } from "@web3-onboard/react";
import { Button, Space } from "antd";
import { AddressButton } from "./AddressButton";

export const ConnectWallet = () => {
    const [{ wallet }, connect, disconnect] = useConnectWallet();

    return (
        !wallet ? <Button icon={<WalletFilled />} type="primary" size="large" onClick={() => connect()}>Connect Wallet</Button> : <Space>
            <AddressButton username={wallet.accounts[0].balance?.["TFUEL"] + " TFUEL"} address={wallet.accounts[0].address} />
            <Button icon={<DisconnectOutlined />} title={"Disconnect"} size="large" onClick={() => disconnect(wallet)} />
        </Space>
    )
}