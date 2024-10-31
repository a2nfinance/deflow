## 1. Introduction
DeFlow is an application designed to streamline complex AI model training and data processing tasks within the Ocean Network ecosystem. It enables users to build and execute computation graphs visually, where each node represents a server (Ocean Node) and each edge signifies data flow between nodes. Users can set up, monitor, and automate complex workflows across multiple nodes seamlessly.

For details about the architecture and how the computation graph functions within DeFlow, please visit [the hackathon details page.](https://dorahacks.io/buidl/18142)

### 2. Demo information 
- [Demo Video](https://www.youtube.com/watch?v=EBQzQ2Jyy1k)
- [Demo App](https://deflow.a2n.finance)
- [Github](https://github.com/a2nfinance/deflow/tree/main)
- [Disease prediction source code (used in demo video)](https://github.com/a2nfinance/deflow-example/tree/main/disease_prediction)
- [Custom Ocean Node docker image](https://hub.docker.com/repository/docker/a2nfinance/ocean_node/general)

All Ocean Nodes in the demo video support both the Oasis Sapphire mainnet and testnet, with ROSE and TEST tokens used for necessary payments.
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
- [Custom Ocean Node Commits](https://github.com/oceanprotocol/ocean-node/compare/feature/c2d_docker...a2nfinance:ocean-node:feature/c2d_docker):

  - **Fix bug related to algorithm path**: The current code uses `/data/transformation/algorithm`; the correct path is `/data/transformations/algorithm`.
  - **Add Typesense database** for storing C2D jobs.
  - **Add C2D environments** from `DOCKER_COMPUTE_ENVIRONMENTS` instead of hardcoding the free environment, allowing a maximum of 30 seconds per task.
  - **Improve logs** for `compute_engine_dockers` and remove temporary database.
- [Custom Ocean Node Docker Image](https://hub.docker.com/repository/docker/a2nfinance/ocean_node/general)
- [Node Communication Component, Customized Based on Ocean CLI](https://github.com/a2nfinance/deflow/tree/main/app/src/oceancli): 
  - Customize Provider class to support the free compute endpoint.
  - Modify commands to align with DeFlow REST APIs.
- [Bull Queue Implementation](https://github.com/a2nfinance/deflow/tree/main/app/src/queue): Manages DeFlow jobs on the server side.
- [DeFlow REST APIs for Publishing Assets and Starting Computations](https://github.com/a2nfinance/deflow/tree/main/app/src/pages/api/oceannode)
- [Custom Code Modifications to Ocean CLI for Compatibility with Ocean Nodes in the C2DV2 Architecture](https://github.com/oceanprotocol/ocean-cli/compare/main...a2nfinance:ocean-cli:main):
Ocean Nodes and `compute_engine_docker` use `fileObject`, but this CLI does not support it. Additionally, the CLI does not support the free Docker engine compute environment, so we customized the source code.



### 4. Installation

#### 4.1. Frontend application
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
| PRIVATE_KEY_[I] | ✅ | Private keys are used for transaction payments; there should be as many keys as the number of Ocean Nodes being used. TEST tokens will be used for payments. |

Commands:

- ```cd app```
- ```npm i```
- ```npm run dev``` for developer mode
- ```npm run build; npm run start``` for production mode


#### 4.2. Ocean Nodes and C2D environments

- [Install Docker Engine on a Remote Machine](https://docs.docker.com/engine/install/debian/)
- [Enable the Docker Daemon](https://docs.docker.com/engine/daemon/)
- [Set Up Ocean Nodes](https://github.com/oceanprotocol/ocean-node/blob/main/docs/dockerDeployment.md)

> **Note:** This guide is not fully up to date, as it does not support some required variables. To start a Docker container for a custom Ocean Node, you can refer to [this sample file](/app/docker-compose.sample.yml). Ensure that your file includes the following environment variables to avoid errors:

  - `DB_URL`
  - `DB_TYPE`
  - `DOCKER_COMPUTE_ENVIRONMENTS`
  - `DOCKER_HOST`
  - `DOCKER_PORT`
  - `DOCKER_PROTOCOL`

> Remember that your remote machine needs specific ports open. Please check your firewall configuration and make sure these ports are accessible: 8000, 9000, 9001, 9002, 9003, 8108 (optional), and 2375 (for Docker Engine with TCP).


#### 4.3. Computation resources

All input nodes in your computation graph require datasets, and all nodes require an algorithm. Therefore, you must publish assets before use.

- [You can use the custom CLI.](https://github.com/a2nfinance/ocean-cli)
- For a better UX, you can use the [DeFlow frontend tools](https://deflow.a2n.finance/assets/publish). However, this tool is not yet complete and is for testing purposes only. You will need to wait and manually verify that assets have been published successfully.

### 5. Technical support

If you would like to contribute to this project or need technical support, please email our project representative at john@a2n.finance.




