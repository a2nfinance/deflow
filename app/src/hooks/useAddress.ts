import { NETWORK_EXPLORER } from "@/configs";

export const useAddress = () => {
    const getShortAddress = (address: string) => {
        return (
            address.slice(0, 7).concat("....").concat(
                address.slice(address.length - 5, address.length)
            )
        )
    };

    const getContractExplorerURL = (address: string) => {
        return `${NETWORK_EXPLORER}/contract/${address}`;
    }

    const openLinkToExplorer = (address: string) => {
        window.open(getContractExplorerURL(address), '_blank');
    }

    return { getShortAddress, getContractExplorerURL, openLinkToExplorer };
};