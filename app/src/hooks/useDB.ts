export const useDB = () => {

    const createExperimentAndRun = async (body: any) => {
        console.log("Create experiment and run:", body)
        await fetch("/api/database/createExperimentAndRun", {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
               "Content-Type": "application/json",
            }
        })
    }

    return {createExperimentAndRun}
}