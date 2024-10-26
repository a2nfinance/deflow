import { Experiment, Run, setExperiment, setJobs, setList, setRun, setRuns } from "@/controller/experiment/experimentSlice";
import { useAppDispatch, useAppSelector } from "@/controller/hooks";
import { actionNames, updateActionStatus } from "@/controller/process/processSlice";
import { JOB_STATES } from "@/database/models/job";
import { RunStates } from "@/database/models/run";
import { checkCompleteWorkflow, oneOfJobFail } from "@/queue/utils";
import { useConnectWallet } from "@web3-onboard/react";

export const useDB = () => {
    const [{ wallet }] = useConnectWallet();
    const { experiment, run } = useAppSelector(state => state.experiment);
    const dispatch = useAppDispatch();
    const createExperiment = async (body: any) => {
        if (wallet?.accounts[0].address) {
            console.log("Create experiment:", body)
            let req = await fetch("/api/database/experiment/save", {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": "application/json",
                }
            })
            let res = await req.json();
            return res;
        }
    }

    const updateExperiment = async (body: any) => {
        if (wallet?.accounts[0].address && experiment._id) {
            console.log("Update experiment:", body)
            let req = await fetch("/api/database/experiment/update", {
                method: "POST",
                body: JSON.stringify({ ...body, _id: experiment._id }),
                headers: {
                    "Content-Type": "application/json",
                }
            })
            let res = await req.json();
            return res;
        }
    }


    const getExperimentsByCreator = async () => {
        if (wallet?.accounts[0].address) {
            dispatch(updateActionStatus({ actionName: actionNames.getExperimentsByCreatorAction, value: true }))
            //get here
            let getReq = await fetch("/api/database/experiment/getList", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ owner: wallet?.accounts[0].address })
            })
            // dispatch here
            const experiments = await getReq.json();
            dispatch(setList(experiments));
            dispatch(updateActionStatus({ actionName: actionNames.getExperimentsByCreatorAction, value: false }))
        }
    }

    const getExperimentByCreatorAndId = async (experimentId: string) => {
        if (wallet?.accounts[0].address) {
            // dispatch(updateActionStatus({ actionName: actionNames.s, value: true }))
            //get here
            let getReq = await fetch("/api/database/experiment/getByCreatorAndId", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ owner: wallet?.accounts[0].address, _id: experimentId })
            })
            // dispatch here
            const experiment = await getReq.json();
            dispatch(setExperiment(experiment));
            // dispatch(updateActionStatus({ actionName: actionNames.getExperimentsByCreatorAction, value: false }))
        }
    }
    const searchRunsByExperimentId = async (experimentId: string) => {
        if (wallet?.accounts[0].address) {
            dispatch(updateActionStatus({ actionName: actionNames.searchRunByExperimentIDAction, value: true }))
            //get here
            let getReq = await fetch("/api/database/run/getByExperimentId", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ owner: wallet?.accounts[0].address, _id: experimentId })
            })
            // dispatch here
            const runs = await getReq.json();
            dispatch(setRuns(runs));
            dispatch(updateActionStatus({ actionName: actionNames.searchRunByExperimentIDAction, value: false }))
        }
    }


    const createRun = async (name: string, experiment: Experiment) => {
        if (wallet?.accounts[0].address) {
            await fetch("/api/database/run/save", {
                method: "POST",
                body: JSON.stringify({
                    experiment_id: experiment._id,
                    name: name,
                    nodes: experiment.nodes,
                    edges: experiment.edges,
                    orders: experiment.orders,
                    owner: experiment.owner
                }),
                headers: {
                    "Content-Type": "application/json",
                }
            })
            searchRunsByExperimentId(experiment._id!);
        }
    }


    const deleteRunById = async (selectedRun: Run) => {
        if (wallet?.accounts[0].address) {
            console.log(selectedRun);
            await fetch("/api/database/run/delete", {
                method: "POST",
                body: JSON.stringify({ owner: selectedRun.owner, _id: selectedRun._id }),
                headers: {
                    "Content-Type": "application/json",
                }
            });
            searchRunsByExperimentId(selectedRun.experiment_id!);
        }

    }

    const getRunById = async (_id: string, notApplyDispatch?: boolean) => {
        if (wallet?.accounts[0].address) {
            let getReq = await fetch("/api/database/run/getByCreatorAndId", {
                method: "POST",
                body: JSON.stringify({ _id: _id, owner: wallet?.accounts[0].address }),
                headers: {
                    "Content-Type": "application/json",
                }
            });

            let run = await getReq.json();
            if (!notApplyDispatch) {
                dispatch(setRun(run))
            }
            return run;

        }

    }
    const updateRunById = async (_id, state) => {
        if (wallet?.accounts[0].address) {
            await fetch("/api/database/run/update", {
                method: "POST",
                body: JSON.stringify({ _id: _id, owner: wallet?.accounts[0].address, state: state }),
                headers: {
                    "Content-Type": "application/json",
                }
            });
        }
    }
    const getJobsByRunId = async (run_id: string) => {
        if (wallet?.accounts[0].address) {
            let run = await getRunById(run_id);
            
            let getRq = await fetch("/api/database/job/getByRunId", {
                method: "POST",
                body: JSON.stringify({ run_id: run_id, owner: wallet?.accounts[0].address }),
                headers: {
                    "Content-Type": "application/json",
                }
            });
            let jobs = await getRq.json();
            dispatch(setJobs(jobs));
            if (run.state === RunStates.FINISHED || run.state === RunStates.FAILED) return;
            let isOneJobFail = oneOfJobFail(jobs)
            if (isOneJobFail) {
                updateRunById(run_id, JOB_STATES.FAILED);
            } else {
                let isCompleted = checkCompleteWorkflow(jobs, 2 * run.nodes.length - 1);
                if (isCompleted) {
                    updateRunById(run_id, JOB_STATES.FINISHED);
                }
            }
         

        }
    }

    const startComputeGraph = async (run_id) => {
        if (wallet?.accounts[0].address) {
            await fetch("/api/oceannode/startComputationGraph", {
                method: "POST",
                body: JSON.stringify({ runId: run_id }),
                headers: {
                    "Content-Type": "application/json",
                }
            });
            await updateRunById(run_id, JOB_STATES.PROCESSING);
            dispatch(setRun({ ...run, state: RunStates.PROCESSING }));
        }
    }

    return {
        createExperiment,
        updateExperiment,
        getExperimentsByCreator,
        searchRunsByExperimentId,
        getExperimentByCreatorAndId,
        createRun,
        deleteRunById,
        getRunById,
        getJobsByRunId,
        startComputeGraph
    }
}