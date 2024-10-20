import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';

// import experimentReducer from './experiment/experimentSlice';
// import modelReducer from './model/modelSlice';
import processReducer from './process/processSlice';
// import runReducer from './run/runSlice';
export function makeStore() {
    return configureStore({
        reducer: {
            process: processReducer,
            // experiment: experimentReducer,
            // run: runReducer,
            // model: modelReducer
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
            }),
    })
}

export const store = makeStore()

export type AppState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    AppState,
    unknown,
    Action<string>
>  