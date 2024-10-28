## Introduction
DeFlow is an application designed to streamline complex AI model training and data processing tasks within the Ocean Network ecosystem. It enables users to build and execute computation graphs visually, where each node represents a server (Ocean Node) and each edge signifies data flow between nodes. Users can set up, monitor, and automate complex workflows across multiple nodes seamlessly.

For details about the architecture and how the computation graph functions within DeFlow, please visit [the hackathon details page.](https://dorahacks.io/buidl/18142)

### 2. Demo information 
- [Demo Video]()
- [Demo App](https://deflow.a2n.finance)
- [Github](https://github.com/a2nfinance/deflow/tree/main)
- [Disease prediction source code (used in demo video)](https://github.com/a2nfinance/deflow-example/tree/main/disease_prediction)
- [Custom Ocean Node docker image](https://hub.docker.com/repository/docker/a2nfinance/ocean_node/general)


<details>
  <summary>
    <b> >>>Click here to see demo screenshots</b>
  </summary>

| ![](https://deflow.a2n.finance/docs/computation_graph_design.png) | 
|:--:| 
| *Design a computation graph* |

| ![](https://deflow.a2n.finance/docs/experiment_detail.png) | 
|:--:| 
| *Details of an experiment* |

| ![](https://deflow.a2n.finance/docs/run_detail.png) | 
|:--:| 
| *Details of an experiment run* |

 </details>

### 3. Code Implementation Details
- [Custom Ocean Node Commits](https://github.com/oceanprotocol/ocean-node/compare/feature/c2d_docker...a2nfinance:ocean-node:feature/c2d_docker)
- [Custom Ocean Node Docker Image](https://hub.docker.com/repository/docker/a2nfinance/ocean_node/general)
- [Node Communication Component, Customized Based on Ocean CLI](https://github.com/a2nfinance/deflow/tree/main/app/src/oceancli)
- [Bull Queue Implementation](https://github.com/a2nfinance/deflow/tree/main/app/src/queue)
- [DeFlow REST APIs for Publishing Assets and Starting Computations](https://github.com/a2nfinance/deflow/tree/main/app/src/pages/api/oceannode)
- [Custom Code Modifications to Ocean CLI for Compatibility with Ocean Nodes in the C2DV2 Architecture](https://github.com/oceanprotocol/ocean-cli/compare/main...a2nfinance:ocean-cli:main)

### 4. Installation
You need to setup the .env file first.

| Environment Variable | Required | Description |
| -------------------- | -------- | ----------- |
| OCEAN_NETWORK | ✅ | Blockchain network (e.g., `oasis_sapphire_testnet`). |
| RPC | ✅ | Network RPC. |
| AQUARIUS_URL | ✅ | Ocean Node Aquarius URL. |
| PROVIDER_URL | ✅ | Ocean Node Provider URL. |
| NODE_URL | ✅ | Ocean Node address (can be the same as Aquarius and Provider URLs). |
| NEXT_PUBLIC_CHAIN_ID | ✅ | Chain ID. |
| NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID | ✅ | WalletConnect project ID for Web3 Onboard. |
| NEXT_PUBLIC_SUPPORT_EMAIL | ✅ | Support email for Web3 Onboard settings. |
| NEXT_PUBLIC_APP_URL | ✅ | Application URL for Web3 Onboard settings. |
| DATABASE_URL | ✅ | MongoDB Atlas Cloud DB URL for this application. |
| REDIS_SERVER | ✅ | Redis database URL for Bull Queue. |
| GIT_TOKEN | ✅ | GitHub secret token. |
| GIT_REPO | ✅ | GitHub repository name. |
| GIT_OWNER | ✅ | GitHub repository owner. |
| GIT_FOLDER_PATH | ✅ | Folder path to store asset files. |
| GIT_NAME | ✅ | GitHub username. |
| GIT_EMAIL | ✅ | GitHub user email. |
| PRIVATE_KEY_[I] | ✅ | Private keys used for transaction payments; should have as many keys as the number of Ocean Nodes being used. |

Commands:

- ```cd app```
- ```npm i```
- ```npm run dev``` for developer mode
- ```npm run build; npm run start``` for production mode





