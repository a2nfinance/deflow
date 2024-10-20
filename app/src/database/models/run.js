import mongoose from 'mongoose';
let Schema = mongoose.Schema;

let run = new Schema({
    experiment_id: {
        type: String,
        require: true
    },
    compute_nodes: {
        type: Object,
        require: true
    },
    compute_graph: {
        type: Object,
        require: true
    },
    execution_orders: {
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
        default: "processing" // processing, failed, finished
    },
    created_at: {
        type: Date,
        required: true,
        default: Date.now
    }
});
let Run = mongoose.model('Experiment', run);
mongoose.models = {};
export default Run;