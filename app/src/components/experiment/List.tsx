import { useDB } from "@/hooks/useDB"
import { List, Spin } from "antd"
import { useEffect } from "react"
import { Item } from "./Item"
import { useAppSelector } from "@/controller/hooks"
import { useConnectWallet } from "@web3-onboard/react"

export const ExperimentList = () => {
    const [{ wallet }] = useConnectWallet();
    const { getExperimentsByCreator } = useDB();
    const { experiments } = useAppSelector(state => state.experiment);
    const { getExperimentsByCreatorAction } = useAppSelector(state => state.process);
    useEffect(() => {
        getExperimentsByCreator();
    }, [wallet?.accounts?.length])
    return (
        <Spin spinning={getExperimentsByCreatorAction}>
            <List
                grid={{
                    gutter: 12,
                    column: 3
                }}
                size="large"
                pagination={{
                    onChange: (page) => {
                        console.log(page);
                    },
                    pageSize: 6,
                    align: "center",
                }}
                dataSource={experiments}
                renderItem={(item, index) => (
                    <Item index={index} experiment={item} />
                )}
            />
        </Spin>
    )
}