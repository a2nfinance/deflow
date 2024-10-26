import {
    createSlice,
    PayloadAction
} from "@reduxjs/toolkit";

export const actionNames = {
    getExperimentsByCreatorAction: "getExperimentsByCreatorAction",
    searchRunByExperimentIDAction: "searchRunByExperimentIDAction",
    createExperimentAction: "createExperimentAction",
    deleteRunAction: "deleteRunAction",
    startComputeGraphAction: "startComputeGraphAction"
}


type Processes = {
    [key: string]: boolean
}

const initialState: Processes = {
    getExperimentsByCreatorAction: false,
    searchRunByExperimentIDAction: false,
    createExperimentAction: false,
    deleteRunAction: false,
    startComputeGraphAction: false
}

export const processesSlice = createSlice({
    name: 'process',
    initialState,
    reducers: {
        updateActionStatus: (state, action: PayloadAction<{ actionName: string, value: boolean }>) => {
            state[action.payload.actionName] = action.payload.value;
        },
    }
})

export const { updateActionStatus } = processesSlice.actions;
export default processesSlice.reducer;