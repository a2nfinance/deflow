import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Experiment {
    _id?: string,
    owner: string,
    name: string,
    description: string,
    nodes: any[],
    orders: any[],
    edges: any[],
    created_at: Date
}

export interface Run {
    _id?: string,
    owner: string,
    name: string,
    experiment_id: string,
    nodes: any[],
    orders: any[],
    edges: any[],
    result: any,
    state: string,
    created_at: Date
}

export interface Job {
    owner: string
    experiment_id: string,
    run_id: string,
    graph_node_id: string,
    ocean_node_url: string,
    job_type: string,
    state: string,
    result: any,
    created_at: Date
}

export type ExperimentState = {
    experiments: Experiment[],
    runs: Run[],
    experiment: Experiment,
    selectedRun: Run,
    run: Run,
    jobs: Job[]
}


const initialExperimentState: ExperimentState = {
    experiments: [],
    runs: [],
    experiment: {
        owner: "",
        name: "",
        description: "",
        nodes: [],
        orders: [],
        edges: [],
        created_at: new Date()
    },
    selectedRun: {
        _id: "",
        owner: "",
        name: "",
        experiment_id: "",
        nodes: [],
        orders: [],
        edges: [],
        result: {},
        state: "",
        created_at: new Date()
    },
    run: {
        _id: "",
        owner: "",
        name: "",
        experiment_id: "",
        nodes: [],
        orders: [],
        edges: [],
        result: {},
        state: "",
        created_at: new Date()
    },
    jobs: [
        {
            owner: "",
            experiment_id: "",
            run_id: "",
            graph_node_id: "",
            ocean_node_url: "",
            job_type: "",
            state: "",
            result: {
                computedJob: {
                    algorithm: {
                        fileObject: {
                            url: ""
                        }
                    },
                    assets: [
                        {
                            fileObject: {
                                url: ""
                            }
                        }
                    ]
                },
                filePath: "",
                ddoId: "",
                nodeUrl: ""
            },
            created_at: new Date()
        }
    ]
}

export const experimentSlice = createSlice({
    name: 'experiment',
    initialState: initialExperimentState,
    reducers: {
        setList: (state: ExperimentState, action: PayloadAction<Experiment[]>) => {
            state.experiments = action.payload
        },
        setRuns: (state: ExperimentState, action: PayloadAction<Run[]>) => {
            state.runs = action.payload
        },
        setExperiment: (state: ExperimentState, action: PayloadAction<Experiment>) => {
            state.experiment = action.payload
        },
        setSelectedRun: (state: ExperimentState, action: PayloadAction<Run>) => {
            state.selectedRun = action.payload
        },
        setRun: (state: ExperimentState, action: PayloadAction<Run>) => {
            state.run = action.payload
        },
        setJobs: (state: ExperimentState, action: PayloadAction<Job[]>) => {
            state.jobs = action.payload
        },

    }
})
export const { setList, setRuns, setExperiment, setSelectedRun, setRun, setJobs } = experimentSlice.actions;
export default experimentSlice.reducer;