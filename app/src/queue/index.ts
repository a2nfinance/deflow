import Queue from "bull";
import connect from "@/database/connect";
const assetQueue = new Queue("asset");
const startComputeQueue = new Queue("compute");
const dbConnect = connect({});
assetQueue.process(async (job, done) => {
    try {
        // Update DB here
        const data = job.data;

        // process here

        // update database here

    } catch(e) {
        // update DB here
    }

})

startComputeQueue.process( async (job, done) => {
    try {
        // Update DB here
        const data = job.data;

        // process here

        // update database here

    } catch(e) {
        // update DB here
    }
})

export {
    assetQueue,
    startComputeQueue
}