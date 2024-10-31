### 0. Vision
To become a comprehensive platform for users to execute data processing and AI model training tasks using Ocean nodes within the C2DV2 architecture.

### 1. Overview

DeFlow is an application designed to streamline complex AI model training and data processing tasks within the Ocean Network ecosystem. It enables users to build and execute computation graphs visually, where each node represents a server (Ocean Node) and each edge signifies data flow between nodes. Users can set up, monitor, and automate complex workflows across multiple nodes seamlessly.

### 2. Demo information 
- [Demo Video](https://www.youtube.com/watch?v=EBQzQ2Jyy1k)
- [Demo App](https://deflow.a2n.finance)
- [Github](https://github.com/a2nfinance/deflow/tree/main)
- [Disease prediction source code (used in demo video)](https://github.com/a2nfinance/deflow-example/tree/main/disease_prediction)
- [Custom Ocean Node docker image](https://hub.docker.com/repository/docker/a2nfinance/ocean_node/general)

All Ocean Nodes in the demo video support the Oasis Sapphire testnet, with TEST tokens used for required payments.
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

### 3. Key Features

- **Graph-Based Workflow Design**: An interactive drag-and-drop interface to create computation graphs for complex tasks.
- **Automated Task Execution**: The application uses topological ordering for efficient node-to-node execution, minimizing manual intervention.
- **Resilience and Error Recovery**: DeFlow logs all task steps and allows recovery from error points, ensuring workflow continuity.
- **Centralized Monitoring and Logs**: Real-time progress visualization, job status, and downloadable assets provide transparency and control over each node's operations.
- **Network Independence**: Server-based execution prevents disruption from user-side network issues.

DeFlow simplifies distributed computation, making it accessible and efficient for tasks requiring scalable resources and reliable data processing within the Ocean Network ecosystem.


### 4. Architecture
![architecture](https://deflow.a2n.finance/docs/Architecture.jpg)

**Infrastructure Layer:**

We use customized Ocean Node Docker images based on the `c2d-docker` branch, incorporating additional features such as environment variable configuration for C2D Docker engines, enhanced logging, bug fixes, and C2D job database handling.

**Integration Layer:**

- **Node Communication**: We customized the Ocean-CLI source code to act as an adapter for DeFlow REST services and custom Ocean Nodes, adding modifications to support free-compute requests based on the Docker Engine C2D environment.
- **External Cloud Database**: We use MongoDB Atlas to store application data related to experiments, runs, jobs, and logs.
- **Core REST APIs**: All tasks from the frontend are processed here, with this component functioning as both the router and controller for application business logic.
- **Other Integrations**:  
  - **Bull Queue**: Manages job requests within the DeFlow server.
  - **GitHub API**: Manages input and output file objects for DDOs.

**Frontend Application Layer:**

Our tech stack includes Next.js, Ant Design, React Flow, and Web3 Onboard.
### 5. How it works
![architecture](https://deflow.a2n.finance/docs/How_it_work.jpg)

This is a simple example demonstrating how DeFlow works with a computation graph:

- **Step 1**: Nodes 01 and 02 begin computation in parallel based on topological order.
- **Step 2**: The output of each computation process from Step 1 is downloaded by the DeFlow application and published to the next nodes (e.g., Node 03 for feature selection). The DDO definition file uses `FileObject` in `services[0]` to define the resource file.
- **Step 3**: Node 03 begins computation once the two required assets, with correct DDO IDs, have been published. This step depends on the number of incoming edges to this node.
- **Step 4**: This step mirrors Step 2 but occurs in Node 03.
- **Step 5**: This step mirrors Step 3 but occurs in Node 04 (prediction).
- **Step 6**: After verifying that all jobs in the process are complete, DeFlow uploads the final result to a file storage host. The user can download this file immediately or at a later time.

The number of required jobs is calculated using the formula:

```number_of_jobs = number_of_edges + number_of_nodes + 1```

The `+1` accounts for the final job, which is downloading the final results and uploading them.


### 6. Challenges we ran into
- **Challenge 01**: Ensuring an algorithm runs correctly within Ocean Nodes using Docker Engine. We spent over a week understanding essential concepts before diving into the code. However, the main branch of the Ocean Node GitHub repository doesn’t include these features, so we chose to work with the feature branch `c2d_docker`. During the initial phase of DeFlow development, we encountered issues and bugs in the c2d_docker branch. Our solution was to customize this branch to achieve full functionality.

- **Challenge 02**: Ensuring all computations follow the correct order and execute automatically based on the designed graph. This task took the majority of development time. Initially, we aimed to reuse Typesense databases and Ocean Node services, but tailoring them to support experiments and multiple runs over time proved challenging. For better control, DeFlow implemented its own database and queue manager to handle all jobs and complex processes. This solution reduces the number of REST requests and allows DeFlow to detect errors in every task. Users can still review and download all assets within computation processes, even if Ocean Nodes or compute environments are disconnected or removed.

### 7. Future Development
Platforms for AI model training and data processing have significant potential for development. In this phase, DeFlow still relies on a set of default accounts with private keys to handle all required transactions, which currently makes it more of a personal tool than a multi-user platform. Implementing a feature that shifts these payments to user accounts via a funding contract or similar mechanism is our top priority for future development. Additional features, such as UX enhancements, improved logging, error control, and execution time optimization, will also be added in subsequent updates.

### 8. Conclusion
We extend special thanks to the Oasis hackathon workshops, Ocean Network's open-source resources, and the supportive community on the Discord channels. Without their contributions, we wouldn't have been able to complete our product on time.
