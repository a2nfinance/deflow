import mongoose from 'mongoose';
let Schema = mongoose.Schema;

let run = new Schema({
    owner: {
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
        default: "processing" // processing, failed, finished
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