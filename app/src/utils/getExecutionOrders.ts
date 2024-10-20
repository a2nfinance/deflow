interface Edge {
    id: string,
    source: string,
    target: string,
    animated?: boolean,
    selected?: boolean
}
const getGraph = (edges: Edge[]) => {
    return edges.map(e => [e.source, e.target]);
}

const detectNoComingVertex = (graph: string[][], node: string) => {
    let endNodes = graph.map(e => e[1]);
    return (endNodes.indexOf(node) === -1)
}

const getCandidates = (graph: string[][]) => {
    let candidates: string[] = [];
    graph.forEach(e => {
        if (detectNoComingVertex(graph, e[0]) && candidates.indexOf(e[0]) === -1) {
            candidates.push(e[0]);
        }
    })
    return candidates;
}

const getOutgoingEdges = (graph: string[][], node: string) => {
     let outEdges: string[][]= [];
     graph.forEach(e => {
        if (e[0] == node) outEdges.push(e);
     });
     return outEdges;
}

const getIncomingEdges = (graph: string[][], node: string) => {
    let inEdges: string[][] = [];
     graph.forEach(e => {
        if (e[1] == node) inEdges.push(e);
     });
     return inEdges;
}

const getTopologicalOrdering = (edges) => {
    let graph = getGraph(edges);
    let newGraph = [...graph];
    let orders: string[][]= [];
    do {
        let candidates: string[] = getCandidates(newGraph);
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
export {
    getGraph,
    getIncomingEdges,
    getOutgoingEdges,
    getTopologicalOrdering
}