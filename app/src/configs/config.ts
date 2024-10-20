import {
	Aquarius,
	ConfigHelper,
	configHelperNetworks,
} from "@oceanprotocol/lib";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

export const oceanConfig = async () => {
	const provider = new ethers.providers.JsonRpcProvider(
		process.env.OCEAN_NETWORK_URL || configHelperNetworks[1].nodeUri
	);
	const publisherAccount = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

	let oceanConfig = new ConfigHelper().getConfig(
		parseInt(String((await publisherAccount.provider!.getNetwork()).chainId))
	);
	const aquarius = new Aquarius(oceanConfig?.metadataCacheUri);

	oceanConfig = {
		...oceanConfig,
		publisherAccount: publisherAccount,
		consumerAccount: publisherAccount,
		aquarius: aquarius,
	};

	return oceanConfig;
}

