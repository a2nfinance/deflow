const preprocessingAlgo = {
    "owner": "0x7b2eb7cEA81Ea3E257dEEAefBE6B0F6A1b411042",
    "nodeUrl": "http://35.247.146.39:8000",
    "assetUrl": "https://raw.githubusercontent.com/a2nfinance/deflow-example/refs/heads/main/disease_prediction/src/data_preprocessing/preprocessing.py",
    "name": "DeFlow - Algo for data preprocessing",
    "entrypoint": "/bin/bash,-c,python3 $ALGO",
    "image": "a2nfinance/disease_prediction",
    "tag": "0.0.2",
    "checksum": "sha256:b8a34b7b4a7d709dec2eb27edac47760e1660ef1a0f2b9433e99c262064d822d"
}

const dataGenerationAlgo = {
    "owner": "0x7b2eb7cEA81Ea3E257dEEAefBE6B0F6A1b411042",
    "nodeUrl": "http://35.240.143.195:8000",
    "assetUrl": "https://raw.githubusercontent.com/a2nfinance/deflow-example/refs/heads/main/disease_prediction/src/data_generation/generation.py",
    "name": "DeFlow - Algo for data generation",
    "entrypoint": "/bin/bash,-c,python3 $ALGO",
    "image": "a2nfinance/disease_prediction",
    "tag": "0.0.2",
    "checksum": "sha256:b8a34b7b4a7d709dec2eb27edac47760e1660ef1a0f2b9433e99c262064d822d"
}

const featureSelectionAlgo = {
    "owner": "0x7b2eb7cEA81Ea3E257dEEAefBE6B0F6A1b411042",
    "nodeUrl": "http://35.240.143.195:8000",
    "assetUrl": "https://raw.githubusercontent.com/a2nfinance/deflow-example/refs/heads/main/disease_prediction/src/feature_selection/train.py",
    "name": "DeFlow - Algo for feature selection",
    "entrypoint": "/bin/bash,-c,python3 $ALGO",
    "image": "a2nfinance/disease_prediction",
    "tag": "0.0.2",
    "checksum": "sha256:b8a34b7b4a7d709dec2eb27edac47760e1660ef1a0f2b9433e99c262064d822d"
}

const predictionAlgo = {
    "owner": "0x7b2eb7cEA81Ea3E257dEEAefBE6B0F6A1b411042",
    "nodeUrl": "http://35.247.146.39:8000",
    "assetUrl": "https://raw.githubusercontent.com/a2nfinance/deflow-example/refs/heads/main/disease_prediction/src/prediction/prediction.py",
    "name": "DeFlow - Algo for disease prediction",
    "entrypoint": "/bin/bash,-c,python3 $ALGO",
    "image": "a2nfinance/disease_prediction",
    "tag": "0.0.2",
    "checksum": "sha256:b8a34b7b4a7d709dec2eb27edac47760e1660ef1a0f2b9433e99c262064d822d"
}

const dataGenerationDataset = {
    "owner": "0x7b2eb7cEA81Ea3E257dEEAefBE6B0F6A1b411042",
    "nodeUrl": "http://35.240.143.195:8000",
    "assetUrl": "https://raw.githubusercontent.com/a2nfinance/deflow-example/refs/heads/main/disease_prediction/data/position.txt",
    "name": "DeFlow - Dataset for data generation"
}

const preprocessingDataset = {
    "owner": "0x7b2eb7cEA81Ea3E257dEEAefBE6B0F6A1b411042",
    "nodeUrl": "http://35.247.146.39:8000",
    "assetUrl": "https://raw.githubusercontent.com/a2nfinance/deflow-example/refs/heads/main/disease_prediction/data/disease.zip",
    "name": "DeFlow - Dataset for preprocessing"
}
const publishAlgo = async (data) => {
    await fetch("http://localhost:8787/api/oceannode/publishAlgoAsset", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    })
}

const publishDataset = async (data) => {
    await fetch("http://localhost:8787/api/oceannode/publishDataAsset", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    })
}

const main = async () => {
    await publishAlgo(preprocessingAlgo);
    await publishAlgo(dataGenerationAlgo);
    await publishAlgo(featureSelectionAlgo);
    await publishAlgo(predictionAlgo);

    await publishDataset(dataGenerationDataset);
    await publishDataset(preprocessingDataset);

}

main().then(() => console.log("Completed"));