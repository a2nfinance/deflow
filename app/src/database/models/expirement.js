import mongoose from 'mongoose';
let Schema = mongoose.Schema;

let experiment = new Schema({
    owner: {
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
    name: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: false
    },
    created_at: {
        type: Date,
        required: true,
        default: Date.now
    }
});
let Experiment = mongoose.model('Experiment', experiment);
mongoose.models = {};
export default Experiment;