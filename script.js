const data = {
    id: 6190,
    label: "061945",
    children: [
        {
            id: 6198,
            label: "009024",
            children: [
                {
                    id: 6204,
                    label: "027874",
                    children: [
                        {
                            id: 33123,
                            lable: "grand grand grand kid",
                            children: []
                        }
                    ]
                },
                {
                    id: 6203,
                    label: "078404",
                    children: []
                },

            ]
        },
        {
            id: 6233,
            label: "2",
            children: [
                {
                    id: 620311,
                    label: "grand kid 1",
                    children: []
                },
                {
                    id: 620311,
                    label: "grand kid 2",
                    children: []
                },
                {
                    id: 620311,
                    label: "grand kid 3",
                    children: []
                },
            ]
        },
        {
            id: 6333,
            label: "3",
            children: [
                {
                    id: 3333,
                    label: "some label",
                    children: []
                },

                {
                    id: 33989,
                    label: "yengi bola",
                    children: [

                        {
                            id: 39030,
                            label: "yengi bola 3",
                            children: []
                        },
                    ]
                },

                {
                    id: 33989,
                    label: "yengi bola 2",
                    children: [
                        { id: 333111, label: "doddmd", children: [] }

                    ]
                }
            ]
        },
    ]
}
var graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });
var paper = new joint.dia.Paper({
    el: $('#paper'),
    width: $('body').width,
    height: '100vh',
    gridSize: 10,
    async: true,
    model: graph,
    cellViewNamespace: joint.shapes,
});

function addCellsRecursive(parentCell, data, depth = 0) {
    var cell = new joint.shapes.standard.Rectangle({
        position: { x: 0, y: 0 }, // Position based on depth and x
        size: { width: 100, height: 50 },
        attrs: { rect: { fill: 'blue' }, text: { text: data.label, fill: 'white' } }
    });
    graph.addCell(cell);
    if (parentCell) {
        var link = new joint.shapes.standard.Link({
            source: { id: parentCell.id },
            target: { id: cell.id },
            router: { name: 'manhattan' },
            connector: { name: 'rounded' },
            attrs: { line: { stroke: 'black' } }
        });
        graph.addCell(link);
        // link.toBack()

    }
    if (data.children && data.children.length > 0) {
        data.children.forEach(function (child) {
            addCellsRecursive(cell, child, depth + 1);
        });
    }
}
addCellsRecursive(null, data);

var layoutGraph = new dagre.graphlib.Graph();
layoutGraph.setGraph({
    rankdir: 'TB',
    align: 'DR',
    ranksep: 0,
    ranker: "longest-path",
    nodesep: 10,
    edgesep: 0,
    marginy: 50,
});
layoutGraph.setDefaultEdgeLabel(function () { return {}; });

graph.getElements().forEach(function (element) {
    layoutGraph.setNode(element.id, {
        width: 200, height: 100
    });
});

graph.getLinks().forEach(function (link) {
    layoutGraph.setEdge(
        link.get('source').id,
        link.get('target').id,
    );
});

graph.on('change:position', function (cell) {
    graph.getLinks().forEach(link => {
        link.findView(paper).requestConnectionUpdate();
    })
})
dagre.layout(layoutGraph);

layoutGraph.nodes().forEach(function (nodeId) {
    var layoutNode = layoutGraph.node(nodeId);
    var cell = graph.getCell(nodeId);
    cell.position(layoutNode.x, layoutNode.y);
});

paper.on('link:mouseenter', function (linkView) {
    var tools = new joint.dia.ToolsView({
        tools: [new joint.linkTools.Vertices()]
    });
    linkView.addTools(tools);
});
paper.on('link:mouseleave', function (linkView) {
    linkView.removeTools();
});

paper.on('cell:pointerdown', function (cellView) {
    cellView.model.set('draggable', true);
});

paper.on('cell:pointermove', function (cellView, evt, x, y) {
    var cell = cellView.model;
    var collision = false;
    graph.getElements().forEach(function (element) {
        if (element.id !== cell.id) {
            var elementBBox = element.getBBox();
            var cellBBox = cell.getBBox();

            if (elementBBox.intersect(cellBBox)) {
                collision = true;
            }
        }
    });
    if (collision) {
        console.log("COLLISION")
        cell.position(cell.previous('position').x, cell.previous('position').y);
    }
});
