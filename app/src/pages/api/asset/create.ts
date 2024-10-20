import { DDO } from "@/@types/DDO/DDO";
import { default as addresses } from '@oceanprotocol/contracts/addresses/address.json';
import { SHA256 } from 'crypto-js'
import {
    Config,
    Aquarius,
    DatatokenCreateParams,
    Files,
    getEventFromTx,
    Nft,
    NftCreateData,
    NftFactory,
    ProviderInstance,
    ZERO_ADDRESS
} from "@oceanprotocol/lib";
import { ethers, Signer } from "ethers";
import { NextApiRequest, NextApiResponse } from 'next';
import { oceanConfig } from "@/configs/config";
const DATASET_ASSET_URL: Files = {
    datatokenAddress: '0x0',
    nftAddress: '0x0',
    files: [
        {
            type: 'url',
            url: 'https://raw.githubusercontent.com/oceanprotocol/testdatasets/main/shs_dataset_test.txt',
            method: 'GET'
        }
    ]
}

const ALGORITHM_ASSET_URL: Files = {
    datatokenAddress: '0x0',
    nftAddress: '0x0',
    files: [
        {
            type: 'url',
            url: 'https://raw.githubusercontent.com/oceanprotocol/testdatasets/main/shs_dataset_test.txt',
            method: 'GET'
        }
    ]
}
/// ```

/// Next, we define the metadata for the dataset and algorithm that will describe our data assets. This is what we call the DDOs
/// ```Typescript
const DATASET_DDO: DDO = {
    '@context': ['https://w3id.org/did/v1'],
    id: 'id:op:efba17455c127a885ec7830d687a8f6e64f5ba559f8506f8723c1f10f05c049c',
    version: '4.1.0',
    chainId: 5,
    nftAddress: '0x0',
    metadata: {
        created: '2021-12-20T14:35:20Z',
        updated: '2021-12-20T14:35:20Z',
        type: 'dataset',
        name: 'dataset-name',
        description: 'Ocean protocol test dataset description',
        author: 'oceanprotocol-team',
        license: 'https://market.oceanprotocol.com/terms',
        additionalInformation: {
            termsAndConditions: true
        }
    },
    services: [
        {
            id: 'notAnId',
            type: 'compute',
            files: '',
            datatokenAddress: '0xa15024b732A8f2146423D14209eFd074e61964F3',
            serviceEndpoint: 'https://v4.provider.goerli.oceanprotocol.com/',
            timeout: 300,
            compute: {
                publisherTrustedAlgorithmPublishers: [],
                publisherTrustedAlgorithms: [],
                allowRawAlgorithm: true,
                allowNetworkAccess: true
            }
        }
    ]
}

const ALGORITHM_DDO: DDO = {
    '@context': ['https://w3id.org/did/v1'],
    id: 'did:op:efba17455c127a885ec7830d687a8f6e64f5ba559f8506f8723c1f10f05c049c',
    version: '4.1.0',
    chainId: 5,
    nftAddress: '0x0',
    metadata: {
        created: '2021-12-20T14:35:20Z',
        updated: '2021-12-20T14:35:20Z',
        type: 'algorithm',
        name: 'algorithm-name',
        description: 'Ocean protocol test algorithm description',
        author: 'oceanprotocol-team',
        license: 'https://market.oceanprotocol.com/terms',
        additionalInformation: {
            termsAndConditions: true
        },
        algorithm: {
            language: 'Node.js',
            version: '1.0.0',
            container: {
                entrypoint: 'node $ALGO',
                image: 'ubuntu',
                tag: 'latest',
                checksum:
                    'sha256:2d7ecc9c5e08953d586a6e50c29b91479a48f69ac1ba1f9dc0420d18a728dfc5'
            }
        }
    },
    services: [
        {
            id: 'notAnId',
            type: 'access',
            files: '',
            datatokenAddress: '0xa15024b732A8f2146423D14209eFd074e61964F3',
            serviceEndpoint: 'https://v4.provider.goerli.oceanprotocol.com',
            timeout: 300
        }
    ]
}


const createAsset = async (
    name: string,
    symbol: string,
    owner: Signer,
    assetUrl: Files,
    ddo: DDO,
    config: Partial<Config>
) => {

    try {
        // let did = "did:op:edf35816dff6bbf96456ba8f144154deac129ccd4f8001cc55fef304c9e652e4"
        // const resolvedDatasetDdo = await aquariusInstance.waitForAqua(did)
        // console.log(resolvedDatasetDdo);
        // return did;
        
        const nft = new Nft(owner, config.chainId)
        const nftFactory = new NftFactory(addresses[process.env.OCEAN_NETWORK!].ERC721Factory, owner)
      
        const nftParamsAsset: NftCreateData = {
            name,
            symbol,
            templateIndex: 1,
            tokenURI: 'aaa',
            transferable: true,
            owner: await owner.getAddress()
        }
        const datatokenParams: DatatokenCreateParams = {
            templateIndex: 1,
            cap: '100000',
            feeAmount: '0',
            paymentCollector: ZERO_ADDRESS,
            feeToken: ZERO_ADDRESS,
            minter: await owner.getAddress(),
            mpFeeAddress: ZERO_ADDRESS
        }

        const bundleNFT = await nftFactory.createNftWithDatatoken(
            nftParamsAsset,
            datatokenParams
        )

        const trxReceipt = await bundleNFT.wait()
        // events have been emitted
        const nftCreatedEvent = getEventFromTx(trxReceipt, 'NFTCreated')
        const tokenCreatedEvent = getEventFromTx(trxReceipt, 'TokenCreated')

        const nftAddress = nftCreatedEvent.args.newTokenAddress
        const datatokenAddressAsset = tokenCreatedEvent.args.newTokenAddress
        // create the files encrypted string
        assetUrl.datatokenAddress = datatokenAddressAsset;
        assetUrl.nftAddress = nftAddress;
        // ddo.chainId = parseInt(config.chainId.toString(10));
        // ddo.services[0].files = await ProviderInstance.encrypt(assetUrl, config.chainId, config.providerUri)
        // ddo.services[0].datatokenAddress = datatokenAddressAsset
        // ddo.services[0].serviceEndpoint = 'http://172.15.0.4:8030' // put back proviederUrl

        // ddo.nftAddress = nftAddress
        let did = 'did:op:' + SHA256(ethers.utils.getAddress(nftAddress) + config.chainId.toString(10))
        let ddo = await config.aquarius.resolve(did);

        const encryptedResponse = await ProviderInstance.encrypt(ddo, config.chainId, config.providerUri);
        const validateResult = await config.aquarius.validate(ddo);
        console.log("validateResult:", validateResult);
        await nft.setMetadata(
            nftAddress,
            await owner.getAddress(),
            0,
            process.env.OCEAN_NETWORK_URL, // put back proviederUrl
            '',
            ethers.utils.hexlify(2),
            encryptedResponse,
            validateResult.hash
        )
        return ddo.id
    } catch(e) {
        console.error("Create asset error:", e);
    }
}


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // const {
        //     name,
        //     symbol,
        //     assetUrl,
        //     ddo,
        // }: {
        //     name: string,
        //     symbol: string,
        //     assetUrl: Files,
        //     ddo: DDO
        // } = req.body;
        try {
            let config = await oceanConfig();
            const provider = new ethers.providers.JsonRpcProvider(
                process.env.OCEAN_NETWORK_URL,
            );

            const publisherAccount: Signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
            let datasetId = await createAsset(
                'D1Min',
                'D1M',
                publisherAccount,
                DATASET_ASSET_URL,
                DATASET_DDO,
                config
              )
            console.log(`dataset id: ${datasetId}`)

            return res.status(200).send({datasetId: datasetId});

        } catch (error) {
            console.log(error)
            return res.status(500).send(error.message);
        }
    } else {
        res.status(422).send('req_method_not_supported');
    }
};

export default handler;