function addStyle(str = '', id = 'add-style') {
    // 样式修改 for .freeTextEditor.internal
    let style = document.createElement("style");
    style.type = "text/css";
    style.id = id;
    style.appendChild(document.createTextNode(str));
    let head = document.getElementsByTagName("head")[0];
    if (!head.querySelector('#' + id)) head.appendChild(style);
}

export { addStyle };