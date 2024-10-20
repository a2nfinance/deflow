import mongoose from 'mongoose';
let Schema = mongoose.Schema;
// experiment_id: The current experiment ID
// run_id: The current run ID
// graph_node_id: Node ID in compute graph nodes
// ocean_node_url: Ocean node URL
// job_type: publish_asset, pulish_algo, start_compute
// state: processing, failed, finished
// result: result of the process
let job = new Schema({
    owner: {
        type: String,
        require: true
    },
    experiment_id: {
        type: String,
        require: false
    },
    run_id: {
        type: String,
        require: false
    },
    graph_node_id: {
        type: String,
        require: false
    },
    ocean_node_url: {
        type: String,
        require: true
    },
    job_type: {
        type: String,
        require: true
    },
    state: {
        type: String,
        require: true,
        default: "processing"
    },
    result: {
        type: Object,
        require: false
    },
    created_at: {
        type: Date,
        required: true,
        default: Date.now
    }
});
let Job = mongoose.model('Job', job);
mongoose.models = {};
export default Job;