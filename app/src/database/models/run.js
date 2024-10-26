import mongoose from 'mongoose';
let Schema = mongoose.Schema;
export const RunStates = {
    CREATED: "created",
    PROCESSING: "processing",
    FAILED: "failed",
    FINISHED: "finished",
}
let run = new Schema({
    owner: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    experiment_id: {
        type: String,
        require: true
    },
    nodes: {
        type: Object,
        require: true
    },
    edges: {
        type: Object,
        require: true
    },
    orders: {
        type: Object,
        require: true
    },
    result: {
        type: Object,
        require: false
    },
    state: {
        type: String,
        require: true,
        default: RunStates.CREATED
    },
    time_started: {
        type: Date,
        required: false,
    },
    time_ended: {
        type: Date,
        required: false,
    },
    created_at: {
        type: Date,
        required: true,
        default: Date.now
    }
});
let Run = mongoose.model('Run', run);
mongoose.models = {};
export default Run;