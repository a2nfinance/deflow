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

export const getShortId = (envID: string) => {
    return (
        envID.slice(0, 10).concat("....").concat(
            envID.slice(envID.length - 15, envID.length)
        )
    )
};