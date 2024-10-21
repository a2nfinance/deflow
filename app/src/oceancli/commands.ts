import {
	Aquarius,
	Asset,
	ComputeJob,
	ComputeOutput,
	Config,
	ConfigHelper,
	Datatoken,
	ProviderInstance,
	amountToUnits,
	getHash,
	orderAsset,
	sendTx
} from "@oceanprotocol/lib";
import fs from "fs";
import util from "util";
import {
	createAsset,
	downloadFile,
	getMetadataURI,
	handleComputeOrder,
	isOrderable,
	updateAssetMetadata,
} from "./helpers";

import { CustomProviderInstance } from "./CustomProvider";

import { Signer, ethers } from "ethers";
import { CustomComputeAlgorithm, CustomComputeAsset } from "./extendtypes";
import { interactiveFlow } from "./interactiveFlow";
import { publishAsset } from "./publishAsset";
import { message } from "antd";

export class Commands {
	public signer: Signer;
	public config: Config;
	public aquarius: Aquarius;
	public providerUrl: string;
	public macOsProviderUrl: string;

	constructor(nodeUrl: string, signer: Signer, network: string | number, config?: Config) {
		this.signer = signer;
		this.config = config || new ConfigHelper().getConfig(network);
		this.providerUrl = nodeUrl;
		this.aquarius = new Aquarius(
			nodeUrl
		);
		console.log(
			"Using Aquarius :",
			nodeUrl
		);
	}

	public async start() {
		console.log('Starting the interactive CLI flow...\n\n');
		const data = await interactiveFlow(this.providerUrl); // Collect data via CLI
		await publishAsset(data, this.signer, this.config); // Publish asset with collected data
	}

	// utils
	public async sleep(ms: number) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}

	// commands
	public async publish(args: any[]) {
		console.log("start publishing");
		let asset: Asset;
		try {
			asset = args[1];
		} catch (e) {
			console.log("Cannot read metadata from " + args[1]);
			console.log(e);
			return { success: false, message: e.message }
		}
		const encryptDDO = args[2] === "false" ? false : true;
		try {
			// add some more checks
			const urlAssetId = await createAsset(
				asset.nft.name,
				asset.nft.symbol,
				this.signer,
				asset.services[0].files,
				asset,
				this.providerUrl,
				this.config,
				this.aquarius,
				1,
				this.macOsProviderUrl,
				encryptDDO
			);
			console.log("Asset published. ID:  " + urlAssetId);
			return { success: true, assetId: urlAssetId }
		} catch (e) {
			console.log("Error when publishing dataset from file");
			console.log(e.message);
			return { success: false, message: e.message }
		}
	}

	public async publishAlgo(args: any[]) {
		try {
			let algoAsset;
			try {
				algoAsset = args[1];
			} catch (e) {
				console.error("Cannot read metadata from " + args[1]);
				console.error(e);
				return;
			}
			const encryptDDO = args[2] === "false" ? false : true;
			// add some more checks
			const algoDid = await createAsset(
				algoAsset.nft.name,
				algoAsset.nft.symbol,
				this.signer,
				algoAsset.services[0].files,
				algoAsset,
				this.providerUrl,
				this.config,
				this.aquarius,
				1,
				this.macOsProviderUrl,
				encryptDDO
			);
			// add some more checks
			console.log("Algorithm published. DID:  " + algoDid);
			return { success: true, assetId: algoDid }
		} catch (e) {
			console.error("Error when publishing algo");
			console.error(e);
			return { success: false, message: e.message }
		}

	}

	public async editAsset(args: string[]) {
		const asset = await this.aquarius.waitForAqua(args[1]);
		if (!asset) {
			console.error(
				"Error fetching DDO " + args[1] + ".  Does this asset exists?"
			);
			return;
		}
		const encryptDDO = args[3] === "false" ? false : true;
		let updateJson;
		try {
			updateJson = JSON.parse(fs.readFileSync(args[2], "utf8"));
		} catch (e) {
			console.error("Cannot read metadata from " + args[2]);
			console.error(e);
			return;
		}
		// Get keys and values
		const keys = Object.keys(updateJson);

		for (const key of keys) {
			asset[key] = updateJson[key];
		}

		const updateAssetTx = await updateAssetMetadata(
			this.signer,
			asset,
			this.providerUrl,
			this.aquarius,
			this.macOsProviderUrl,
			encryptDDO
		);
		console.log("Asset updated. Tx: " + JSON.stringify(updateAssetTx, null, 2));
	}

	public async getDDO(args: string[]) {
		console.log("Resolving Asset with DID: " + args[1]);
		const resolvedDDO = await this.aquarius.waitForAqua(args[1]);
		if (!resolvedDDO) {
			console.log(
				"Error fetching Asset with DID: " +
				args[1] +
				".  Does this asset exists?"
			);
			return {success: false, message: "Error fetching Asset with DID: " +
				args[1] +
				".  Does this asset exists?"}
		} else console.log(util.inspect(resolvedDDO, false, null, true));
		return {success: true, resolvedDDO: resolvedDDO}
	}

	public async download(args: string[]) {
		const dataDdo = await this.aquarius.waitForAqua(args[1]);
		if (!dataDdo) {
			console.error(
				"Error fetching DDO " + args[1] + ".  Does this asset exists?"
			);
			return;
		}

		const providerURI =
			this.macOsProviderUrl && dataDdo.chainId === 8996
				? this.macOsProviderUrl
				: dataDdo.services[0].serviceEndpoint;
		console.log("Downloading asset using provider: ", providerURI);
		const datatoken = new Datatoken(this.signer, this.config.chainId);

		const tx = await orderAsset(
			dataDdo,
			this.signer,
			this.config,
			datatoken,
			providerURI
		);

		if (!tx) {
			console.error(
				"Error ordering access for " + args[1] + ".  Do you have enough tokens?"
			);
			return;
		}

		const orderTx = await tx.wait();

		const urlDownloadUrl = await ProviderInstance.getDownloadUrl(
			dataDdo.id,
			dataDdo.services[0].id,
			0,
			orderTx.transactionHash,
			providerURI,
			this.signer
		);
		try {
			const path = args[2] ? args[2] : '.';
			const { filename } = await downloadFile(urlDownloadUrl, path);
			console.log("File downloaded successfully:", path + "/" + filename);
		} catch (e) {
			console.log(`Download url dataset failed: ${e}`);
		}
	}

	public async computeStart(args: string[]) {

		const inputDatasetsString = args[1];
		let inputDatasets: string[] = [];

		if (
			inputDatasetsString.includes("[") ||
			inputDatasetsString.includes("]")
		) {
			const processedInput = inputDatasetsString
				.replaceAll("]", "")
				.replaceAll("[", "");
			inputDatasets = processedInput.split(",");
		} else {
			inputDatasets.push(inputDatasetsString);
		}

		const ddos: any[] = [];

		for (const dataset in inputDatasets) {
			const dataDdo = await this.aquarius.waitForAqua(inputDatasets[dataset]);
			if (!dataDdo) {
				console.log(
					"Error fetching DDO " + dataset[1] + ".  Does this asset exists?"
				);
				return {success: false, message: "Error fetching DDO " + dataset[1] + ".  Does this asset exists?"};
			} else {
				ddos.push(dataDdo);
			}
		}
		if (ddos.length <= 0 || ddos.length != inputDatasets.length) {
			console.log("Not all the data ddos are available.");
			return;
		}
		const providerURI =
			this.macOsProviderUrl && ddos[0].chainId === 8996
				? this.macOsProviderUrl
				: ddos[0].services[0].serviceEndpoint;

		const algoDdo = await this.aquarius.waitForAqua(args[2]);
		if (!algoDdo) {
			console.log(
				"Error fetching DDO " + args[1] + ".  Does this asset exists?"
			);
			return {success: false, message: "Error fetching DDO " + args[1] + ".  Does this asset exists?"};
		}

		const computeEnvs = await ProviderInstance.getComputeEnvironments(
			this.providerUrl
		);

		const datatoken = new Datatoken(
			this.signer,
			(await this.signer.provider!.getNetwork()).chainId
		);

		const mytime = new Date();
		const computeMinutes = 5;
		mytime.setMinutes(mytime.getMinutes() + computeMinutes);
		const computeValidUntil = Math.floor(mytime.getTime() / 1000);

		const computeEnvID = args[3];
		const chainComputeEnvs = computeEnvs[algoDdo.chainId];
		let computeEnv = chainComputeEnvs[0];

		if (computeEnvID && computeEnvID.length > 1) {
			for (const index in chainComputeEnvs) {
				if (computeEnvID == chainComputeEnvs[index].id) {
					computeEnv = chainComputeEnvs[index];
					continue;
				}
			}
		}

		const algo: CustomComputeAlgorithm = {
			fileObject: algoDdo.services[0].fileObject,
			documentId: algoDdo.id,
			serviceId: algoDdo.services[0].id,
			meta: algoDdo.metadata.algorithm
		};

		const assets: CustomComputeAsset[] = [];
		for (const dataDdo in ddos) {
			const canStartCompute = isOrderable(
				ddos[dataDdo],
				ddos[dataDdo].services[0].id,
				algo,
				algoDdo
			);
			if (!canStartCompute) {
				console.log(
					"Error Cannot start compute job using the datasets DIDs & algorithm DID provided"
				);
				return {success: false, message: "Error Cannot start compute job using the datasets DIDs & algorithm DID provided"};
			}
			assets.push({
				fileObject: ddos[dataDdo].services[0].fileObject,
				documentId: ddos[dataDdo].id,
				serviceId: ddos[dataDdo].services[0].id,
			});
		}
		console.log("Starting compute job using provider: ", providerURI);
		const providerInitializeComputeJob =
			await ProviderInstance.initializeCompute(
				assets,
				algo,
				computeEnv.id,
				computeValidUntil,
				providerURI,
				await this.signer.getAddress()
			);
		if (
			!providerInitializeComputeJob ||
			"error" in providerInitializeComputeJob.algorithm
		) {
			console.log(
				"Error initializing Provider for the compute job using dataset DID " +
				args[1] +
				" and algorithm DID " +
				args[2]
			);

			return {success: false, message: "Error initializing Provider for the compute job using dataset DID " +
				args[1] +
				" and algorithm DID " +
				args[2] };
		}

		console.log("Ordering algorithm: ", args[2]);
		algo.transferTxId = await handleComputeOrder(
			providerInitializeComputeJob.algorithm,
			algoDdo,
			this.signer,
			computeEnv.consumerAddress,
			0,
			datatoken,
			this.config,
			providerInitializeComputeJob?.algorithm?.providerFee,
			providerURI
		);
		if (!algo.transferTxId) {
			console.log(
				"Error ordering compute for algorithm with DID: " +
				args[2] +
				".  Do you have enough tokens?"
			);
			return {success: false, message: "Error ordering compute for algorithm with DID: " +
				args[2] +
				".  Do you have enough tokens?" };
		}

		for (let i = 0; i < ddos.length; i++) {
			assets[i].transferTxId = await handleComputeOrder(
				providerInitializeComputeJob.datasets[i],
				ddos[i],
				this.signer,
				computeEnv.consumerAddress,
				0,
				datatoken,
				this.config,
				providerInitializeComputeJob?.datasets[i].providerFee,
				providerURI
			);
			if (!assets[i].transferTxId) {
				console.log(
					"Error ordering dataset with DID: " +
					assets[i] +
					".  Do you have enough tokens?"
				);
				return {success: false, message: "Error ordering dataset with DID: " +
					assets[i] +
					".  Do you have enough tokens?" };
			}
		}

		const additionalDatasets = assets.length > 1 ? assets.slice(1) : null;
		console.log(
			"Starting compute job on " +
			assets[0].documentId +
			" with additional datasets:" +
			(!additionalDatasets ? "none" : additionalDatasets[0].documentId)
		);

		const output: ComputeOutput = {
			metadataUri: await getMetadataURI()
		}

		const computeJobs = await CustomProviderInstance.computeStart(
			providerURI,
			this.signer,
			computeEnv.id,
			assets,
			algo,
			undefined,
			//@ts-ignore
			additionalDatasets,
			output
		);
		console.log("Output:", output);
		if (computeJobs && computeJobs[0]) {
			const { jobId, agreementId } = computeJobs[0];
			console.log("Compute started.  JobID: " + jobId);
			console.log("Agreement ID: " + agreementId);
			console.log("Computed Jobs:", computeJobs[0]);
			return {success: true, result: {
				oceanNodeJobId: jobId,
				agreementId: agreementId,
				computedJob: computeJobs[0]
			} };
		} else {
			console.log("Error while starting the compute job: ", computeJobs);
			return {success: false, message: `Error while starting the compute job: ${computeJobs}`};
		}
	}

	public async computeStop(args: string[]) {
		const dataDdo = await this.aquarius.waitForAqua(args[1]);
		if (!dataDdo) {
			console.error(
				"Error fetching DDO " + args[1] + ".  Does this asset exists?"
			);
			return;
		}
		const hasAgreementId = args.length === 4;

		const jobId = args[2]
		let agreementId = "";
		if (hasAgreementId) {
			agreementId = args[3];
		}

		const providerURI =
			this.macOsProviderUrl && dataDdo.chainId === 8996
				? this.macOsProviderUrl
				: dataDdo.services[0].serviceEndpoint;

		const jobStatus = await ProviderInstance.computeStop(
			args[1],
			await this.signer.getAddress(),
			jobId,
			providerURI,
			this.signer,
			agreementId
		);
		console.log(jobStatus);
	}

	public async allowAlgo(args: string[]) {
		const asset = await this.aquarius.waitForAqua(args[1]);
		if (!asset) {
			console.error(
				"Error fetching DDO " + args[1] + ".  Does this asset exists?"
			);
			return;
		}

		if (asset.nft.owner !== (await this.signer.getAddress())) {
			console.error(
				"You are not the owner of this asset, and there for you cannot update it."
			);
			return;
		}

		if (asset.services[0].type !== "compute") {
			console.error(
				"Error getting computeService for " +
				args[1] +
				".  Does this asset has an computeService?"
			);
			return;
		}
		const algoAsset = await this.aquarius.waitForAqua(args[2]);
		if (!algoAsset) {
			console.error(
				"Error fetching DDO " + args[2] + ".  Does this asset exists?"
			);
			return;
		}
		const encryptDDO = args[3] === "false" ? false : true;
		let filesChecksum;
		try {
			filesChecksum = await ProviderInstance.checkDidFiles(
				algoAsset.id,
				algoAsset.services[0].id,
				algoAsset.services[0].serviceEndpoint,
				true
			);
		} catch (e) {
			console.error("Error checking algo files: ", e);
			return;
		}

		const containerChecksum =
			algoAsset.metadata.algorithm.container.entrypoint +
			algoAsset.metadata.algorithm.container.checksum;
		const trustedAlgorithm = {
			did: algoAsset.id,
			containerSectionChecksum: getHash(containerChecksum),
			filesChecksum: filesChecksum?.[0]?.checksum,
		};
		asset.services[0].compute.publisherTrustedAlgorithms.push(trustedAlgorithm);
		try {
			const txid = await updateAssetMetadata(
				this.signer,
				asset,
				this.providerUrl,
				this.aquarius,
				this.macOsProviderUrl,
				encryptDDO
			);
			console.log("Successfully updated asset metadata: " + txid);
		} catch (e) {
			console.error("Error updating asset metadata: ", e);
			return;
		}
	}

	public async disallowAlgo(args: string[]) {
		const asset = await this.aquarius.waitForAqua(args[1]);
		if (!asset) {
			console.error(
				"Error fetching DDO " + args[1] + ".  Does this asset exists?"
			);
			return;
		}
		if (asset.nft.owner !== (await this.signer.getAddress())) {
			console.error(
				"You are not the owner of this asset, and there for you cannot update it."
			);
			return;
		}
		if (asset.services[0].type !== "compute") {
			console.error(
				"Error getting computeService for " +
				args[1] +
				".  Does this asset has an computeService?"
			);
			return;
		}
		if (asset.services[0].compute.publisherTrustedAlgorithms) {
			console.error(
				" " + args[1] + ".  Does this asset has an computeService?"
			);
			return;
		}
		const encryptDDO = args[3] === "false" ? false : true;
		const indexToDelete =
			asset.services[0].compute.publisherTrustedAlgorithms.findIndex(
				(item) => item.did === args[2]
			);

		if (indexToDelete !== -1) {
			asset.services[0].compute.publisherTrustedAlgorithms.splice(
				indexToDelete,
				1
			);
		} else {
			console.error(
				" " +
				args[2] +
				".  is not allowed by the publisher to run on " +
				args[1]
			);
			return;
		}

		const txid = await updateAssetMetadata(
			this.signer,
			asset,
			this.providerUrl,
			this.aquarius,
			this.macOsProviderUrl,
			encryptDDO
		);
		console.log("Asset updated " + txid);
	}

	public async getJobStatus(args: string[]) {
		// args[1] - did (for checking if data asset exists, legacy)
		// args[2] - jobId
		// args[3] - agreementId
		const hasAgreementId = args.length === 4;

		const dataDdo = await this.aquarius.waitForAqua(args[1]);
		if (!dataDdo) {
			console.error(
				"Error fetching DDO " + args[1] + ".  Does this asset exists?"
			);
			return;
		}
		const jobId = args[2]
		let agreementId = "";
		if (hasAgreementId) {
			agreementId = args[3];
		}
		const providerURI =
			this.macOsProviderUrl && dataDdo.chainId === 8996
				? this.macOsProviderUrl
				: dataDdo.services[0].serviceEndpoint;

		const jobStatus = (await ProviderInstance.computeStatus(
			providerURI,
			await this.signer.getAddress(),
			jobId,
			agreementId
		)) as ComputeJob;
		console.log(util.inspect(jobStatus, false, null, true));
		return jobStatus;
	}

	public async downloadJobResults(args: string[]) {

		const jobResult = await ProviderInstance.getComputeResultUrl(
			this.providerUrl,
			this.signer,
			args[1],
			parseInt(args[2])
		);
		console.log("jobResult ", jobResult);

		try {
			const path = args[3] ? args[3] : '.';
			const { filename } = await downloadFile(jobResult, path, parseInt(args[2]));
			console.log("File downloaded successfully:", path + "/" + filename);
		} catch (e) {
			console.log(`Download url dataset failed: ${e}`);
		}
	}

	public async mintOceanTokens() {
		const minAbi = [
			{
				constant: false,
				inputs: [
					{ name: "to", type: "address" },
					{ name: "value", type: "uint256" },
				],
				name: "mint",
				outputs: [{ name: "", type: "bool" }],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
		];

		const tokenContract = new ethers.Contract(
			this.config.oceanTokenAddress,
			minAbi,
			this.signer
		);
		const estGasPublisher = await tokenContract.estimateGas.mint(
			this.signer.getAddress(),
			amountToUnits(null, null, "1000", 18)
		);
		await sendTx(
			estGasPublisher,
			this.signer,
			1,
			tokenContract.mint,
			await this.signer.getAddress(),
			amountToUnits(null, null, "1000", 18)
		);
	}
}
