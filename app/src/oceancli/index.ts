import { ethers } from "ethers";
import { Commands } from "./commands";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.RPC) {
	console.error("Have you forgot to set env RPC?");
	process.exit(0);
}

function help() {
	console.log("Available options:");

	console.log("\t getDDO DID - gets DDO for an asset using the asset did");

	console.log(
		"\t publish METADATA_FILE ENCRYPT_DDO - reads MEDATDATA_FILE and publishes a new asset with access service or compute service, if boolean ENCRYPT_DDO is false publishes DDO without encrypting. "
	);
	console.log(
		"\t publishAlgo METADATA_FILE ENCRYPT_DDO - reads MEDATDATA_FILE and publishes a new algo, if boolean ENCRYPT_DDO is false publishes DDO without encrypting. "
	);

	console.log(
		"\t editAsset DATASET_DID UPDATED_METADATA_FILE ENCRYPT_DDO- updates DDO using the metadata items in the file, if boolean ENCRYPT_DDO is false publishes DDO without encrypting."
	);

	console.log(
		"\t download DID DESTINATION_FOLDER - downloads an asset into downloads/DESTINATION_FOLDER"
	);
	console.log(
		"\t allowAlgo DATASET_DID ALGO_DID ENCRYPT_DDO - approves an algorithm to run on a dataset, if boolean ENCRYPT_DDO is false publishes DDO without encrypting."
	);
	console.log(
		"\t disallowAlgo DATASET_DID ALGO_DID ENCRYPT_DDO- removes an approved algorithm from the dataset approved algos, if boolean ENCRYPT_DDO is false publishes DDO without encrypting."
	);
	console.log(
		"\t startCompute [DATASET_DIDs] ALGO_DID COMPUTE_ENV_ID - starts a compute job on the selected compute environment with the datasets and the inputed algorithm. Pass the DATASET_DIDs separated by comma"
	);

	console.log(
		"\t stopCompute DATASET_DID JOB_ID - stops the compute process for the mentioned dataset with the given job id! "
	);

	console.log(
		"\t getJobStatus DATASET_DID JOB_ID - displays the compute job compute status."
	);

	console.log(
		"\t getJobResults DATASET_DID JOB_ID - displays the array containing compute results and logs files."
	);

	console.log(
		"\t downloadJobResults JOB_ID RESULT_INDEX DESTINATION_FOLDER - Downloads compute job results."
	);
}

export async function start(nodeUrl: string, args: any[], accountNumber: number) {
	const provider = new ethers.providers.JsonRpcProvider(process.env.RPC);
	console.log("Using RPC: " + process.env.RPC);
	let PRIVATE_KEY = process.env[`PRIVATE_KEY_${accountNumber}`];
	console.log("Private key:", PRIVATE_KEY);
	let signer = new ethers.Wallet(PRIVATE_KEY!, provider);
	
	console.log("Using account: " + (await signer.getAddress()));

	const { chainId } = await signer.provider.getNetwork();
	const commands = new Commands(nodeUrl, signer, chainId);
	switch (args[0]) {
		case "start":
			await commands.start()
			break
		case "getDDO":
			let ddo = await commands.getDDO(args);
			return ddo;
		case "publish":
			let publishResult = await commands.publish(args);
			return publishResult;
		case "publishAlgo":
			let algoResult = await commands.publishAlgo(args);
			return algoResult;
		case "edit":
			await commands.editAsset(args);
			break;
		case "download":
			await commands.download(args);
			break;
		case "allowAlgo":
			await commands.allowAlgo(args);
			break;
		case "disallowAlgo":
			await commands.disallowAlgo(args);
			break;
		case "startCompute":
			let computeResult = await commands.computeStart(args);
			return computeResult;
		case "stopCompute":
			await commands.computeStop(args);
			break;
		case "getJobStatus":
			let jobStatus = await commands.getJobStatus(args);
			return jobStatus;
		case "downloadJobResults":
			let downloadResult = await commands.downloadJobResults(args);
			return downloadResult;
		case "mintOcean":
			await commands.mintOceanTokens();
			break;
		case "h":
			help();
			break;
		default:
			console.error("Not sure what command to use ? use h for help.");
			break;
	}
}
