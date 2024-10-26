export const removeMeasuredField = (nodes: any[]) => {
    const removedMeasuredNodes = nodes.map((node) => {
        return {
            data: node.data,
            id: node.id,
            position: node.position,
            type: node.type
        }
    })

    return removedMeasuredNodes;
}