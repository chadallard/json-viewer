import extractJSON from './extract-json';

const bodyModified = false;

function allTextNodes(nodes) {
  return !Object.keys(nodes).some(function (key) {
    return nodes[key].nodeName !== '#text'
  })
}

function getPreWithSource() {
  var childNodes = document.body.childNodes;

  if (childNodes.length === 0) {
    return null
  }

  if (childNodes.length > 1 && allTextNodes(childNodes)) {
    if (process.env.NODE_ENV === 'development') {
      console.debug("[JSONViewer] Loaded from a multiple text nodes, normalizing");
    }

    document.body.normalize() // concatenates adjacent text nodes
  }

  var childNode = childNodes[0];
  var nodeName = childNode.nodeName
  var textContent = childNode.textContent

  if (nodeName === "PRE") {
    return childNode;
  }

  // if Content-Type is text/html
  if (nodeName === "#text" && textContent.trim().length > 0) {
    if (process.env.NODE_ENV === 'development') {
      console.debug("[JSONViewer] Loaded from a text node, this might have returned content-type: text/html");
    }

    var pre = document.createElement("pre");
    pre.textContent = textContent;
    document.body.removeChild(childNode);
    document.body.appendChild(pre);
    bodyModified = true;
    return pre;
  }

  return null
}

function restoreNonJSONBody() {
  var artificialPre = document.body.lastChild;
  var removedChildNode = document.createElement("text");
  removedChildNode.textContent = artificialPre.textContent;
  document.body.insertBefore(removedChildNode, document.body.firstChild);
  document.body.removeChild(artificialPre);
}

function isJSON(text) {
  try {
    const json = extractJSON(text);
    JSON.parse(json);
    return true;

  } catch (e) {
    return false;
  }
}

function isJSONP(jsonStr) {
  return isJSON(extractJSON(jsonStr));
}

function checkIfJson(callback, pre) {
  const elements = pre ? [pre] : document.getElementsByTagName("pre");

  for (let i = 0, len = elements.length; i < len; i++) {
    const element = elements[i];
    const textContent = element.textContent;

    if (textContent && isJSON(textContent)) {
      callback(element);
    }
  }
}

export default {
  checkIfJson: checkIfJson,
  isJSON: isJSON
};
