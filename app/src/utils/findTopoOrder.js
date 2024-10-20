let edges = [
    {
        "id": "1-2",
        "source": "1",
        "target": "2"
    },
    {
        "source": "4",
        "target": "2",
        "id": "xy-edge__4-2"
    },
    {
        "source": "5",
        "target": "4",
        "id": "xy-edge__5-4"
    },
    {
        "source": "5",
        "target": "2",
        "id": "xy-edge__5-2"
    }
]

const getGraph = (edges) => {
    return edges.map(e => [e.source, e.target]);
}

const detectNoComingVertex = (graph, node) => {
    let endNodes = graph.map(e => e[1]);
    return (endNodes.indexOf(node) === -1)
}

const getCandidates = (graph) => {
    let candidates = [];
    graph.forEach(e => {
        if (detectNoComingVertex(graph, e[0]) && candidates.indexOf(e[0]) === -1) {
            candidates.push(e[0]);
        }
    })
    return candidates;
}

const getOutgoingEdges = (graph, node) => {
     let outEdges = [];
     graph.forEach(e => {
        if (e[0] == node) outEdges.push(e);
     });
     return outEdges;
}

const getIncomingEdges = (graph, node) => {
    let inEdges = [];
     graph.forEach(e => {
        if (e[1] == node) inEdges.push(e);
     });
     return inEdges;
}

const getTopologicalOrdering = (graph) => {
    let newGraph = [...graph];
    let orders = [];
    do {
        let candidates = getCandidates(newGraph);
        orders.push(candidates);
        candidates.forEach((a) => {
            let outEdges = getOutgoingEdges(graph, a);
            outEdges.forEach(e => {
                newGraph.splice(newGraph.indexOf(e), 1); 
            });
            if (!newGraph.length) {
                orders.push([outEdges[0][1]])
            }
        })
        
    } while(newGraph.length)
    

    return (newGraph.length ? [] : orders);
}
let graph = getGraph(edges);
   
console.log("Graph:", graph);
console.log("Orders:", getTopologicalOrdering(graph))
console.log("Incoming edges node 2:", getIncomingEdges(graph, '2'));