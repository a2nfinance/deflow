import mongoose from 'mongoose';
let Schema = mongoose.Schema;

let experiment = new Schema({
    owner: {
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