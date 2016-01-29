window.onload = initMindmap();

function initMindmap() {

    var Mindmap = new MindmapFrame(document.getElementById('container'));

    window.onmousedown = Mindmap.eventManager.on;
    window.onmouseup = Mindmap.eventManager.on;
    window.onmousemove = Mindmap.eventManager.on;
    window.onwheel = Mindmap.eventManager.on;
    window.onmousewheel = Mindmap.eventManager.on;
    window.ondblclick = Mindmap.eventManager.on;
}
