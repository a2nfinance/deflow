import { useAddress } from "@/hooks/useAddress";
import { Button, message } from "antd";

export const AddressButton = ({ username, address }: { username: string, address: string }) => {
    const [messageApi, contextHolder] = message.useMessage();
    const {getShortAddress} = useAddress();
    return (
        <>
            {contextHolder}
            <Button type="primary" size="large" onClick={
                () => {
                    window.navigator.clipboard.writeText(address);
                    messageApi.success("Copied address");
                }
            }>{getShortAddress(address)} | {username}</Button>
        </>
    )
}