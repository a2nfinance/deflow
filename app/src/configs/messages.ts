
export const createExperimentMessage = (experimentId?: string) => ({
    title: "Create new experiment",
    success: `A new experiment with ID ${experimentId} created`,
    fail: "Fail to create new experiment!"
})


export const createRegisteredModelMessage = (name?: string) => ({
    title: "Register new model",
    success: `A new model with ID ${name} registered`,
    fail: "Fail to register new model!"
})

export const updateRegisteredModelMessage = (name?: string) => ({
    title: "Update a registered model",
    success: `A new version updated`,
    fail: "Fail to update the registered model!"
})