import { JOB_STATES } from "@/database/models/job";

const getAccountNumberForNodes = (nodes) => {
    let accountNumbers = {};
    let count = 0;
    for(let i = 0; i < nodes.length; i++) {
        if (!accountNumbers[nodes[i].data.ocean_node_address]) {
            accountNumbers[nodes[i].data.ocean_node_address] = count + 1;
            ++count;
        }
       
    }
    return accountNumbers;
}

const checkCompleteWorkflow = (jobs, numberOfActions) => {
    let isNotFinishJobs = jobs.filter(j => j.state !== JOB_STATES.FINISHED);
    if (jobs.length !== numberOfActions || isNotFinishJobs.length) {
        return false;
    }
    return true;
}

export {
    checkCompleteWorkflow, getAccountNumberForNodes
};
