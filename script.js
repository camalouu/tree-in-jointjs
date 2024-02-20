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
                    children: []
                },
                {
                    id: 6203,
                    label: "078404",
                    children: []
                },
                {
                    id: 620311,
                    label: "078404333",
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
            children: []
        },
        {
            id: 6209,
            label: "078404",
            children: []
        },
        {
            id: 6803,
            label: "078404",
            children: []
        }
    ]
}

var graph = new joint.dia.Graph;

var paper = new joint.dia.Paper({
    el: $('#paper'),
    width: screen.width,
    height: screen.height,
    gridSize: 10,
    async: true,
    model: graph
});

function addCellsRecursive(parentCell, data, depth = 0, x = screen.width / 2) {
    var cell = new joint.shapes.standard.Rectangle({
        position: { x: x, y: 250 * depth }, // Position based on depth and x
        size: { width: 100, height: 50 },
        attrs: { rect: { fill: 'blue' }, text: { text: data.label, fill: 'white' } }
    });

    graph.addCell(cell);

    if (parentCell) {
        var link = new joint.shapes.standard.Link({
            source: { id: parentCell.id },
            target: { id: cell.id },
            router: { name: 'orthogonal' },
            connector: { name: 'rounded' },
            attrs: { line: { stroke: 'black' } }
        });
        graph.addCell(link);
    }

    if (data.children && data.children.length > 0) {
        var childX = x - 150 * (data.children.length - 1) / 2; // Initial x-position for children
        data.children.forEach(function (child) {
            addCellsRecursive(cell, child, depth + 1, childX);
            childX += 150; // Increase x-position for next child
        });
    }
}
addCellsRecursive(null, data);

var layoutGraph = new dagre.graphlib.Graph();
layoutGraph.setGraph({ rankdir: 'TB' });
layoutGraph.setDefaultEdgeLabel(function () { return {}; });

graph.getElements().forEach(function (element) {
    layoutGraph.setNode(element.id, {
        width: 200, height: 100
    });
});

graph.getLinks().forEach(function (link) {
    layoutGraph.setEdge(link.get('source').id, link.get('target').id);
});

dagre.layout(layoutGraph);

// Apply positions to cells based on layout
layoutGraph.nodes().forEach(function (nodeId) {
    var layoutNode = layoutGraph.node(nodeId);
    var cell = graph.getCell(nodeId);
    cell.position(layoutNode.x, layoutNode.y);
});

graph.on('change:position', function (cell) {
    if (graph.getCells().indexOf(cell) > -1) {
        graph.getLinks().forEach(link => link.findView(paper).requestConnectionUpdate())
    }
})
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
    // Make the elements draggable
    cellView.model.set('draggable', true);
});

paper.on('cell:pointermove', function (cellView, evt, x, y) {
    var cell = cellView.model;
    var collision = false;

    // Check for collision with any other element
    graph.getElements().forEach(function (element) {
        if (element.id !== cell.id) {
            var elementBBox = element.getBBox();
            var cellBBox = cell.getBBox();

            if (elementBBox.intersect(cellBBox)) {
                collision = true;
            }
        }
    });

    // If there is a collision, revert the cell to its original position
    if (collision) {
        console.log("COLLISION")
        cell.position(cell.previous('position').x, cell.previous('position').y);
    }
});
