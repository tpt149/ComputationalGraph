var inputExpressionElem = document.getElementById('input-expression')
var btnUpdateExpressionElem = document.getElementById('update-expression')
var btnSubmitElem = document.getElementById('btn-submit')
var btnNextElem = document.getElementById('next-control-btn')
var btnResetElem = document.getElementById('reset-control-btn')
var mainWorkspaceElem = document.getElementById('main-workspace')
var varGroupElem = document.getElementById('var-group')
var btnClearElem = document.getElementById('btn-clear')
var nodeList = []
var graphTable = null
var nodeElemList = null
var edgeElemList = null
var danhSachQuyTrinh = null
var currentStep = -1
btnNextElem.disabled = true
btnResetElem.disabled = true
btnUpdateExpressionElem.addEventListener('click', handleUpdateExpression)
btnSubmitElem.addEventListener('click', handleSubmitExpression)
btnNextElem.addEventListener('click', handleNext)
btnResetElem.addEventListener('click', handleSubmitExpression)
btnClearElem.addEventListener('click', handleClear)
inputExpressionElem.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        handleUpdateExpression()
    }
})

var NODERADIUS = 15
var DISTANCEX = 120
var DISTANCEY = 100

function Step(toanHang1, toanTu, toanHang2) {
    this.toanHang1 = toanHang1
    this.toanTu = toanTu
    this.toanHang2 = toanHang2
}

function Node(id, label, type) {
    this.id = id
    this.label = label
    this.type = type // 0: biến, 1: toán tử, -1: ngoặc
}


function NodeElem(id, x, y, label) {
    this.id = id
    this.x = x
    this.y = y
    this.label = label
}

function EdgeElem(id1, id2) {
    this.id1 = id1
    this.id2 = id2
}

function Value(type, data) {
    this.type = type
    this.data = data
}

function getNode(nodeList, id) {
    for (let i = 0; i < nodeList.length; i++) {
        if (nodeList[i].id === id) {
            return nodeList[i]
        }
    }
    return false
}

function handleClear() {
    nodeList = []
    graphTable = null
    nodeElemList = null
    edgeElemList = null
    danhSachQuyTrinh = null
    currentStep = -1
    btnNextElem.disabled = true
    btnResetElem.disabled = true
    inputExpressionElem.value = ''
    varGroupElem.innerHTML = ''
    mainWorkspaceElem.innerHTML = ''
    inputExpressionElem.focus()
}

function handleBtnSwitch(e) {

    var tArray = e.target.id.split('-')
    var varId = tArray[tArray.length - 1]
    var inputVarElem = document.getElementById('var-' + varId)
    if (inputVarElem) {
        var inputElem = inputVarElem.getElementsByTagName('input')[0]
        var areaElem = inputVarElem.getElementsByTagName('textarea')[0]
        if (inputElem.classList.contains('display-none')) {
            inputElem.classList.remove('display-none')
        } else {
            inputElem.classList.add('display-none')
        }
        if (areaElem.classList.contains('display-none')) {
            areaElem.classList.remove('display-none')
        } else {
            areaElem.classList.add('display-none')
        }
    }
}

function handleUpdateExpression() { // Xử lý ấn nút cập nhật
    expression = splitExpression(inputExpressionElem.value)
    console.log(expression)
    // Kiểm tra tính hợp lệ của biểu thức
    if (checkExpression(expression)) {
        // Tạo input biến
        var varGroupInnerHtml = ''
        var tabIndex = 1
        expression.forEach((x, index) => {
            if (ktPhanTu(x) == 0) {
                if (expression.findIndex(elem => elem === x) === index) {
                    varGroupInnerHtml += `
                        <div class="input-var-group">
                            <div class="input-var-label">${x} = </div>
                            <div class="input-var" id="var-${x}">

                                <input tabindex=${tabIndex + 1} type="text" class="input var-input-text" placeholder="Nhập số">
                                <textarea tabindex=${tabIndex + 1} id="" rows="3" class="display-none var-textarea" placeholder="Nhập ma trận"></textarea>
                            </div>
                            <button id="switch-type-var-${x}" class="btn btn-switch" onclick="handleBtnSwitch(event)">
                                <i class="ti-loop" style="margin-right: 4px;"></i>
                                Đổi
                            </button>
                            
                        </div>
                    `
                    tabIndex++
                }
            }
        })
        varGroupElem.innerHTML = varGroupInnerHtml

        // Add event cho button


        // Tạo dữ liệu
        nodeList = taoNodeList(expression)
        console.log(nodeList)
        danhSachQuyTrinh = taoDanhSachQuyTrinh(nodeList)
        console.log(danhSachQuyTrinh)
        // Tạo html
        nodeElemList = createNodeElemList(nodeList, danhSachQuyTrinh)
        edgeElemList = createEdgeElemList(danhSachQuyTrinh)
        mainWorkspaceElem.innerHTML = ''
        drawNode(nodeElemList)
        drawEdge(edgeElemList)
        currentStep = -1
        btnNextElem.disabled = true
        btnResetElem.disabled = true
    } else {
        alert('Biểu thức không hợp lệ')
    }
}


function handleSubmitExpression() {
    expression = splitExpression(inputExpressionElem.value)

    // Kiểm tra tính hợp lệ của biểu thức
    if (checkExpression(expression)) {

        // Tạo dữ liệu
        nodeList = taoNodeList(expression)
        danhSachQuyTrinh = taoDanhSachQuyTrinh(nodeList)
        graphTable = taoBangDoThi(nodeList, danhSachQuyTrinh)

        // Tạo html
        nodeElemList = createNodeElemList(nodeList, danhSachQuyTrinh)
        edgeElemList = createEdgeElemList(danhSachQuyTrinh)
        mainWorkspaceElem.innerHTML = ''
        drawNode(nodeElemList)
        drawEdge(edgeElemList)

        // Tạo giá trị cho biến
        for (var i = 0; i < nodeList.length; i++) {
            if (nodeList[i].type === 0) {
                var label = nodeList[i].label
                var inputOfLabel = document.getElementById('var-' + label)
                // Kiểm tra là số hay ma trận, tạo biến Value
                var inputElem = inputOfLabel.getElementsByTagName('input')[0]
                var areaElem = inputOfLabel.getElementsByTagName('textarea')[0]
                if (inputOfLabel) {
                    if (!inputElem.classList.contains('display-none')) { // Là số
                        if (checkNumber(inputElem.value)) {
                            // Tìm các cạnh ra của node
                            graphTable.forEach((row, index) => {
                                if (row[nodeList[i].id] === '#') {
                                    row[nodeList[i].id] = new Value(0, toNum(inputElem.value))

                                    // Thay đổi html
                                    var edge = document.getElementById(`edge-${nodeList[i].id}-${index}`)
                                    if (edge) {
                                        edge.classList.remove('hidden-num')
                                        var edgeNum = edge.getElementsByClassName('edge-num')
                                        edgeNum[0].innerHTML = inputElem.value
                                    }
                                }
                            })
                            currentStep = 0
                            btnNextElem.disabled = false
                            btnResetElem.disabled = false
                        } else {
                            alert('Giá trị của biến không hợp lệ')
                            currentStep = -1
                            btnNextElem.disabled = true
                            btnResetElem.disabled = true
                            return
                        }
                    } else { // Là ma trận
                        console.log('vao ma tran')
                        var mt = str2mt(areaElem.value)
                        if (ktMaTran(mt)) {
                            // Tìm các cạnh ra của node
                            graphTable.forEach((row, index) => {
                                if (row[nodeList[i].id] === '#') {
                                    row[nodeList[i].id] = new Value(1, mt)

                                    // Thay đổi html
                                    var edge = document.getElementById(`edge-${nodeList[i].id}-${index}`)
                                    if (edge) {
                                        edge.classList.remove('hidden-num')
                                        var edgeNum = edge.getElementsByClassName('edge-num')
                                        edgeNum[0].innerHTML = Mt2Elem(mt)
                                    }
                                }
                            })
                            currentStep = 0
                            btnNextElem.disabled = false
                            btnResetElem.disabled = false
                        } else {
                            alert('Giá trị của biến không hợp lệ')
                            currentStep = -1
                            btnNextElem.disabled = true
                            btnResetElem.disabled = true
                            return
                        }
                    }

                } else {
                    alert('Không tìm thấy biến')
                    currentStep = -1
                    btnNextElem.disabled = true
                    btnResetElem.disabled = true
                    return
                }
            }

        }

    } else {
        alert('Biểu thức không hợp lệ')
        currentStep = -1
        btnNextElem.disabled = true
        btnResetElem.disabled = true
        return
    }
    console.table(graphTable)
}

function handleNext() {
    if (currentStep == -1) {
        alert('Chưa cập nhật giá trị')
        return
    }
    if (currentStep == -2) {
        alert('Đã hoàn thành')
        return
    }
    var step = danhSachQuyTrinh[currentStep]
    if (currentStep === danhSachQuyTrinh.length - 1) { // Xử lý bước cuối cùng
        var toanHang1 = graphTable[step.toanTu][step.toanHang1]
        var toanTu = getNode(nodeList, step.toanTu).label
        var toanHang2 = null
        if (step.toanHang2 !== null)
            toanHang2 = graphTable[step.toanTu][step.toanHang2]
        var result = calc(toanHang1, toanHang2, toanTu)

        console.log(result)
        // Cập nhật giao diện
        var nodeToanTu = document.getElementById('node-' + step.toanTu)
        var edge1 = document.getElementById(`edge-${step.toanHang1}-${step.toanTu}`)
        var edge2 = null
        if (step.toanHang2 !== null)
            edge2 = document.getElementById(`edge-${step.toanHang2}-${step.toanTu}`)
        var edgeToanTu = document.getElementById(`edge-final`)
        nodeToanTu.classList.add('active')
        edge1.classList.add('active')
        if (step.toanHang2 !== null)
            edge2.classList.add('active')
        setTimeout(() => {
            var edgeNum = edgeToanTu.getElementsByClassName('edge-num')
            if (result.type == 0) {
                edgeNum[0].innerHTML = (result.data.toFixed(3) == result.data ? result.data : result.data.toFixed(3))
            } else if (result.type == 1) {
                edgeNum[0].innerHTML = Mt2Elem(result.data)
            } else {
                edgeNum[0].innerHTML = '?'
            }
            edgeToanTu.classList.remove('hidden-num')
            edgeToanTu.classList.add('result')
        }, 800)

        setTimeout(() => {
            nodeToanTu.classList.remove('active')
            edge1.classList.remove('active')
            if (step.toanHang2 !== null)
                edge2.classList.remove('active')
            edgeToanTu.classList.remove('result')
        }, 2500)

        currentStep = -2
        btnNextElem.disabled = true
        btnResetElem.disabled = false
    } else {
        // Cập nhật bảng đồ thị
        var toanHang1 = graphTable[step.toanTu][step.toanHang1] // kieu Value
        var toanTu = getNode(nodeList, step.toanTu).label
        var toanHang2 = null
        if (step.toanHang2 !== null)
            toanHang2 = graphTable[step.toanTu][step.toanHang2]
        var indexNodeSauToanTu
        var result
        graphTable.forEach((row, index) => {
            if (row[step.toanTu] === '#') {
                result = calc(toanHang1, toanHang2, toanTu)
                row[step.toanTu] = result
                indexNodeSauToanTu = index
            }
        })
        console.table(graphTable)
        console.log(indexNodeSauToanTu)


        // Cập nhật giao diện
        var nodeToanTu = document.getElementById('node-' + step.toanTu)
        var edge1 = document.getElementById(`edge-${step.toanHang1}-${step.toanTu}`)
        var edge2 = null
        if (step.toanHang2 !== null)
            edge2 = document.getElementById(`edge-${step.toanHang2}-${step.toanTu}`)
        var edgeToanTu = document.getElementById(`edge-${step.toanTu}-${indexNodeSauToanTu}`)
        nodeToanTu.classList.add('active')
        edge1.classList.add('active')
        if (step.toanHang2 !== null)
            edge2.classList.add('active')
        setTimeout(() => {
            var edgeNum = edgeToanTu.getElementsByClassName('edge-num')
            if (result.type == 0) {
                edgeNum[0].innerHTML = (result.data.toFixed(3) == result.data ? result.data : result.data.toFixed(3))
            } else if (result.type == 1) {
                edgeNum[0].innerHTML = Mt2Elem(result.data)
            } else {
                edgeNum[0].innerHTML = '?'
            }
            edgeToanTu.classList.remove('hidden-num')
            edgeToanTu.classList.add('result')
        }, 1000)

        setTimeout(() => {
            nodeToanTu.classList.remove('active')
            edge1.classList.remove('active')
            if (step.toanHang2 !== null)
                edge2.classList.remove('active')
            edgeToanTu.classList.remove('result')
        }, 3000)

        currentStep++
    }
}

function calc(toanHang1, toanHang2, toanTu) {
    var result = new Value(-1, '?')
    if (toanHang1.type === -1) {
        return result
    }
    if (toanHang2) {
        if (toanHang2.type === -1) {
            return result
        }
    }


    if (toanTu === '+') {
        if (toanHang1.type === 0 && toanHang2.type === 0) {
            result.type = 0
            result.data = toNum(toanHang1.data) + toNum(toanHang2.data)
        } else if (toanHang1.type === 1 && toanHang2.type === 0) {
            return result
        } else if (toanHang1.type === 0 && toanHang2.type === 1) {
            return result
        } else if (toanHang1.type === 1 && toanHang2.type === 1) {
            result.type = 1
            result.data = MtCongMt(toanHang1.data, toanHang2.data)
        }
    } else if (toanTu === '-') {
        if (toanHang1.type === 0 && toanHang2.type === 0) {
            result.type = 0
            result.data = toNum(toanHang1.data) - toNum(toanHang2.data)
        } else if (toanHang1.type === 1 && toanHang2.type === 0) {
            return result
        } else if (toanHang1.type === 0 && toanHang2.type === 1) {
            return result
        } else if (toanHang1.type === 1 && toanHang2.type === 1) {
            result.type = 1
            result.data = MtTruMt(toanHang1.data, toanHang2.data)
        }
    } else if (toanTu === '*') {
        if (toanHang1.type === 0 && toanHang2.type === 0) {
            result.type = 0
            result.data = toNum(toanHang1.data) * toNum(toanHang2.data)
        } else if (toanHang1.type === 1 && toanHang2.type === 0) {
            result.type = 1
            result.data = MtNhanSo(toanHang1.data, toanHang2.data)
        } else if (toanHang1.type === 0 && toanHang2.type === 1) {
            result.type = 1
            result.data = SoNhanMt(toanHang1.data, toanHang2.data)
        } else if (toanHang1.type === 1 && toanHang2.type === 1) {
            result.type = 1
            result.data = MtNhanMt(toanHang1.data, toanHang2.data)
        }
    } else if (toanTu === '/') {
        if (toanHang1.type === 0 && toanHang2.type === 0) {
            result.type = 0
            result.data = toNum(toanHang1.data) / toNum(toanHang2.data)
        } else {
            return result
        }
    } else {
        if (toanTu[0] === '^') {
            if (toanHang1.type === 0) {
                result.type = 0
                console.log(toanTu)
                result.data = toNum(toanHang1.data) ** toNum(toanTu.slice(1))
            } else {
                return result
            }
        } else {
            return result
        }
    }
    console.log(result)
    if (result.type === 0) {
        if (isNaN(result.data) || !Number.isFinite(result.data)) {
            return new Value(-1, '?')
        }
    }
    if (result.data === '?') {
        return new Value(-1, '?')
    }
    return result
}

function checkNumber(num) {
    if (isNaN(parseFloat(num))) {
        return false
    }
    return true
}

function toNum(str) {
    return parseFloat(str)
}

function drawNode(nodeElemList) {
    var html = nodeElemList.map(nodeElem => (
        `
        <div class="node" id="node-${nodeElem.id}" style="
            top: ${nodeElem.y - NODERADIUS}px;
            left: ${nodeElem.x - NODERADIUS}px;
            "
        >
            ${nodeElem.label}
        </div>
        `
    )).join('')
    mainWorkspaceElem.innerHTML += html
}

function drawEdge(edgeElemList) {
    var html = edgeElemList.map(edgeElem => {
        var node1 = getNodeElem(nodeElemList, edgeElem.id1)
        var node2 = getNodeElem(nodeElemList, edgeElem.id2)
        var angle = Math.atan((node2.y - node1.y) / (node2.x - node1.x))
        var length = Math.sqrt((node2.x - node1.x) ** 2 + (node2.y - node1.y) ** 2) - NODERADIUS * 2
        var left = (node2.x + node1.x) / 2 - length / 2
        var top = (node2.y + node1.y) / 2
        return (
            `
            <div class="edge-group hidden-num" id="edge-${edgeElem.id1}-${edgeElem.id2}" style="
                left: ${left}px;
                width: ${length}px;
                top: ${top}px;
            ">
                <div class="edge" style="
                    left: 0;
                    right: 0;
                    top: 0;
                    transform: rotate(${angle}rad);
                ">
                    <div class="arrow"></div>
                </div>
                <div class="edge-num"></div>
            </div>
            `
        )
    }).join('')
    mainWorkspaceElem.innerHTML += html

    var finalNode = nodeElemList[nodeElemList.length - 1]
    mainWorkspaceElem.innerHTML += `
        <div class="edge-group hidden-num" id="edge-final" style="
            left: ${finalNode.x + NODERADIUS}px;
            width: ${DISTANCEX}px;
            top: ${finalNode.y}px;
        ">
            <div class="edge" style="
                left: 0;
                right: 0;
                top: 0;
            ">
                <div class="arrow"></div>
            </div>
            <div class="edge-num"></div>
        </div>
    `
}

function createNodeElemList(nodeList, danhSachQuyTrinh) {
    var maxX = 0
    var maxY = 0
    var nodeElemList = []

    var yNodeVar = 0; // y cua cac node bien
    // Tao node cac bien
    nodeList.forEach(node => {
        if (node.type === 0) {
            if (nodeElemList.findIndex(nodeElem => nodeElem.id === node.id) === -1) {
                maxY = yNodeVar
                nodeElemList.push(new NodeElem(node.id, 0, yNodeVar, node.label))
                yNodeVar += DISTANCEY
            }
        }


    })

    danhSachToanTu1Ngoi = {} // idNode: [toanTu, ...]
    danhSachQuyTrinh.forEach(step => {
        if (step.toanHang2 === null) {
            if (danhSachToanTu1Ngoi[step.toanHang1]) {
                danhSachToanTu1Ngoi[step.toanHang1]++
            } else {
                danhSachToanTu1Ngoi[step.toanHang1] = 1
            }
        }
    })
    // Dựa vào bảng quy trình để tạo các node phía sau
    danhSachQuyTrinh.forEach(step => {
        var nodeToanTu = getNode(nodeList, step.toanTu)
        var nodeElem1 = getNodeElem(nodeElemList, step.toanHang1)
        var nodeElem2 = null
        if (step.toanHang2 !== null)
            nodeElem2 = getNodeElem(nodeElemList, step.toanHang2)

        var xNewNodeElem
        var yNewNodeElem
        if (nodeElem2 !== null) {
            xNewNodeElem = Math.max(nodeElem1.x, nodeElem2.x) + DISTANCEX
            yNewNodeElem = (nodeElem1.y + nodeElem2.y) / 2
        }
        else {
            var soLuong = --danhSachToanTu1Ngoi[step.toanHang1]
            xNewNodeElem = nodeElem1.x + DISTANCEX
            yNewNodeElem = nodeElem1.y + soLuong * (NODERADIUS * 2 + 4)
        }
        if (xNewNodeElem > maxX) {
            maxX = xNewNodeElem
        }
        nodeElemList.push(new NodeElem(nodeToanTu.id, xNewNodeElem, yNewNodeElem, nodeToanTu.label))
    })

    // Đẩy vào giữa
    var widthOfGraph = maxX + DISTANCEX
    var heightOfGraph = maxY
    var offsetX = (mainWorkspaceElem.clientWidth - widthOfGraph) / 2
    var offsetY = (mainWorkspaceElem.clientHeight - heightOfGraph) / 2
    return nodeElemList.map(nodeElem => new NodeElem(
        nodeElem.id,
        nodeElem.x + offsetX,
        nodeElem.y + offsetY,
        nodeElem.label
    ))
}

function createEdgeElemList(danhSachQuyTrinh) {
    var edgeElemList = []
    danhSachQuyTrinh.forEach(step => {
        edgeElemList.push(new EdgeElem(step.toanHang1, step.toanTu))
        if (step.toanHang2 !== null)
            edgeElemList.push(new EdgeElem(step.toanHang2, step.toanTu))
    })
    return edgeElemList
}

function getNodeElem(nodeElemList, id) {
    for (let i = 0; i < nodeElemList.length; i++) {
        if (nodeElemList[i].id === id) {
            return nodeElemList[i]
        }
    }
    return false
}

function taoBangDoThi(nodeList, danhSachQuyTrinh) {
    var graphTable
    var maxNodeListId = -1
    for (var i = 0; i < nodeList.length; i++) {
        if (maxNodeListId < nodeList[i].id) {
            maxNodeListId = nodeList[i].id
        }
    }

    var headingGraph = []
    for (let index = 0; index <= maxNodeListId; index++) {
        headingGraph.push(null)
    }

    graphTable = headingGraph.map(_ => (
        headingGraph.map(_ => null)
    ))

    danhSachQuyTrinh.forEach(step => {
        graphTable[step.toanTu][step.toanHang1] = '#'
        if (step.toanHang2 !== null)
            graphTable[step.toanTu][step.toanHang2] = '#'
    })

    return graphTable
}

function taoNodeList(expression) {
    var id = 0
    var nodeList = []
    expression.forEach(elem => {
        if (ktPhanTu(elem) === 0) { // Biến
            var indexNode = nodeList.findIndex(node => node.label === elem)
            if (indexNode === -1) { // Chưa có biến trong nodeList
                nodeList.push(new Node(id, elem, 0))
                id++
            } else {
                nodeList.push(new Node(nodeList[indexNode].id, elem, 0))
            }
        } else if (ktPhanTu(elem) === 1) { // Toán tử
            nodeList.push(new Node(id, elem, 1))
            id++
        } else { // Dấu ngoặc
            nodeList.push(new Node(-1, elem, -1))
        }
    })
    return nodeList
}

function splitExpression(stringExpression) { // Tách chuỗi biểu thức thành mảng 
    var expression = stringExpression.split(' ').join('').split('')

    for (var i = 0; i < expression.length; i++) {
        if (expression[i] === '^') {

            var vt = 1
            var toanTu = '^'
            while (!isNaN(expression[i + vt])) {
                toanTu += expression[i + vt]
                vt++
            }
            expression[i] = toanTu
            expression.splice(i + 1, vt)


            var t = expression[i]
            expression[i] = expression[i - 1]
            expression[i - 1] = t
        }
    }

    // Chèn cặp ngoặc bao quanh cả biểu thức
    expression.push(')')
    expression = ['(', ...expression]
    return expression
}


function ktPhanTu(str) { //0: biến, 1: toán tử, -1: không hợp lệ
    if ((/[a-zA-Z]/).test(str)) {
        return 0;
    }

    switch (str) {
        case '+':
        case '-':
        case '*':
        case '/':
            return 1;
        default:
            break;
    }
    if (str[0] === '^') {
        return 1
    }
    return -1;
}

function doUuTien(operatorStr) { // Xác định độ ưu tiên của một toán tử
    if (operatorStr == "+" || operatorStr == "-")
        return 1;
    if (operatorStr == "*" || operatorStr == "/")
        return 2;
    if (operatorStr == '^2' || operatorStr == '^3')
        return 3;
}

function taoDanhSachQuyTrinh(nl) { // Quy trình để tính toán
    var _nodeList = []
    nl.forEach(x => {
        _nodeList.push({ ...x })
    })
    var danhSachQuyTrinh = []
    while (_nodeList.length > 1) {
        var vtNgoacMo = -1;
        var vtNgoacDong = -1;

        // Xác định vị trí dấu ngoặc
        for (var i = 0; i < _nodeList.length; i++) {
            if (_nodeList[i].type === -1) {
                if (_nodeList[i].label == "(") {
                    vtNgoacMo = i;
                }
                if (_nodeList[i].label == ")") {
                    vtNgoacDong = i;
                    break;
                }
            }

        }
        if (vtNgoacMo == -1 || vtNgoacDong == -1)
            return false;

        // Tính toán biểu thức cho đến khi chỉ còn 1 phần tử giữa cặp ngoặc
        while (vtNgoacDong - vtNgoacMo > 2) {
            // Xác định vị trí toán tử sẽ được tính toán
            var vtToanTu = -1;
            for (var i = vtNgoacMo + 1; i <= vtNgoacDong - 1; i++) {
                if (_nodeList[i].type == 1) {
                    if (vtToanTu == -1 ||
                        doUuTien(_nodeList[vtToanTu].label) < doUuTien(_nodeList[i].label) ||
                        vtToanTu == i - 1 // Phía sau toán tử là một toán tử khác --> toán tử phía sau là 1 ngôi
                    )
                        vtToanTu = i;
                }
            }
            if (vtToanTu == -1) // Không tìm thấy toán tử
            {
                if (vtNgoacDong - vtNgoacMo != 2 ||
                    _nodeList[vtNgoacMo + 1].type != 0
                )
                    return false;
            }
            else {
                // Phía trước và phía sau toán tử là số --> toán tử 2 ngôi
                if (_nodeList[vtToanTu - 1].type == 0 && _nodeList[vtToanTu + 1].type == 0) {
                    switch (_nodeList[vtToanTu].label) {
                        case "+":
                            _nodeList[vtToanTu].type = 0;
                            break;
                        case "-":
                            _nodeList[vtToanTu].type = 0;
                            break;
                        case "*":
                            _nodeList[vtToanTu].type = 0;
                            break;
                        case "/":
                            _nodeList[vtToanTu].type = 0;
                            break;
                        default:
                            return false;
                    }
                    danhSachQuyTrinh.push(new Step(_nodeList[vtToanTu - 1].id, _nodeList[vtToanTu].id, _nodeList[vtToanTu + 1].id))
                    _nodeList.splice(vtToanTu + 1, 1);
                    _nodeList.splice(vtToanTu - 1, 1);
                    vtNgoacDong -= 2
                }
                // Toán tử 1 ngôi
                else if (_nodeList[vtToanTu + 1].type == 0) {
                    if ((_nodeList[vtToanTu].label)[0] === '^') {
                        _nodeList[vtToanTu].type = 0;
                    } else {
                        return false
                    }

                    danhSachQuyTrinh.push(new Step(_nodeList[vtToanTu + 1].id, _nodeList[vtToanTu].id, null))
                    _nodeList.splice(vtToanTu + 1, 1);
                    vtNgoacDong--;
                }
                else
                    return false;
            }
        }

        // Xoá ngoặc
        _nodeList.splice(vtNgoacDong, 1);
        _nodeList.splice(vtNgoacMo, 1);
    }

    if (_nodeList.length == 0 || _nodeList[0].type != 0)
        return false;
    return danhSachQuyTrinh;
}

function checkExpression(ex) { // Kiểm tra tính hợp lệ của biểu thức
    var expression = [...ex]
    while (expression.length > 1) {
        var vtNgoacMo = -1;
        var vtNgoacDong = -1;

        // Xác định vị trí dấu ngoặc
        for (var i = 0; i < expression.length; i++) {
            if (expression[i] == "(") {
                vtNgoacMo = i;
            }
            if (expression[i] == ")") {
                vtNgoacDong = i;
                break;
            }
        }
        if (vtNgoacMo == -1 || vtNgoacDong == -1)
            return false;


        // Tính toán biểu thức cho đến khi chỉ còn 1 phần tử giữa cặp ngoặc
        while (vtNgoacDong - vtNgoacMo > 2) {
            // Xác định vị trí toán tử sẽ được tính toán
            var vtToanTu = -1;
            for (var i = vtNgoacMo + 1; i <= vtNgoacDong - 1; i++) {
                if (ktPhanTu(expression[i]) == 1) {
                    if (vtToanTu == -1 ||
                        doUuTien(expression[vtToanTu]) < doUuTien(expression[i]) ||
                        vtToanTu == i - 1 // Phía sau toán tử là một toán tử khác --> toán tử phía sau là 1 ngôi
                    )
                        vtToanTu = i;
                }
            }



            if (vtToanTu == -1) // Không tìm thấy toán tử
            {
                if (vtNgoacDong - vtNgoacMo != 2 ||
                    ktPhanTu(expression[vtNgoacMo + 1]) != 0
                )
                    return false;
            }
            else {
                // Phía trước và phía sau toán tử là số --> toán tử 2 ngôi
                if (ktPhanTu(expression[vtToanTu - 1]) == 0 && ktPhanTu(expression[vtToanTu + 1]) == 0) {
                    var toanHang1 = +expression[vtToanTu - 1];
                    var toanHang2 = +expression[vtToanTu + 1];
                    switch (expression[vtToanTu]) {
                        case "+":
                            expression[vtToanTu - 1] = (toanHang1 + toanHang2) + '';
                            break;
                        case "-":
                            expression[vtToanTu - 1] = (toanHang1 - toanHang2) + '';
                            break;
                        case "*":
                            expression[vtToanTu - 1] = (toanHang1 * toanHang2) + '';
                            break;
                        case "/":
                            expression[vtToanTu - 1] = (toanHang1 / toanHang2) + '';
                            break;
                        default:
                            return false;
                    }
                    expression.splice(vtToanTu + 1, 1);
                    expression.splice(vtToanTu, 1);
                    vtNgoacDong -= 2;
                }
                // Toán tử 1 ngôi
                else if (ktPhanTu(expression[vtToanTu + 1]) == 0) {
                    if (expression[vtToanTu][0] === '^') {
                        expression[vtToanTu] = toanHang1 + ''
                    } else {
                        return false
                    }
                    expression.splice(vtToanTu + 1, 1);
                    vtNgoacDong--;
                }
                else
                    return false;
            }
        }

        // Xoá ngoặc
        expression.splice(vtNgoacDong, 1);
        expression.splice(vtNgoacMo, 1);
    }

    if (expression.length == 0 || ktPhanTu(expression[0]) != 0)
        return false;
    return true
}


function Mt2Elem(m) {

    var testWidth = document.createElement('span')
    document.body.appendChild(testWidth);
    testWidth.style.font = "monospace";
    testWidth.style.fontSize = 13 + "px";
    testWidth.style.position = 'absolute';
    testWidth.innerHTML = '2';
    var widthChar = testWidth.clientWidth
    document.body.removeChild(testWidth);

    var html = ''
    var maxWidth = 0
    for (var row = 0; row < m.length; row++) {
        var rowHtml = ''
        var rowString = ''
        for (var col = 0; col < m[0].length; col++) {
            var num = toNum(m[row][col])
            num = num.toFixed(3) == num ? num : num.toFixed(3)
            rowHtml += `<div class="elem-matrix">${num}</div>`
            rowString += (num + ' ')
        }
        if (maxWidth < (rowString.length - 1) * widthChar) {
            maxWidth = (rowString.length - 1) * widthChar
        }
        console.log(rowString.length - 1)
        rowHtml = `<div class="row-matrix">${rowHtml}</div>`
        html += rowHtml
    }
    console.log(widthChar)
    console.log(maxWidth)
    html = `<div class="matrix" style="width: ${maxWidth}px">${html}</div>`


    return html
}

function ktMaTran(mt) {
    var cols = mt[0].length
    for (var i = 0; i < mt.length; i++) {
        if (mt[i].length !== cols) {
            return false
        } else {
            for (var j = 0; j < mt[i].length; j++) {
                if (!checkNumber(mt[i][j])) {
                    return false
                }
            }
        }
    }
    return true
}

function MtCongMt(mt1, mt2) {
    if (mt1.length !== mt2.length || mt1[0].length !== mt2[0].length) {
        return '?'
    } else {
        return mt1.map((mt1Row, row) => mt1Row.map((mt1Elem, col) => (
            toNum(mt1Elem) + toNum(mt2[row][col])
        )))
    }
}

function MtTruMt(mt1, mt2) {
    if (mt1.length !== mt2.length || mt1[0].length !== mt2[0].length) {
        return '?'
    } else {
        return mt1.map((mt1Row, row) => mt1Row.map((mt1Elem, col) => (
            toNum(mt1Elem) - toNum(mt2[row][col])
        )))
    }
}

function MtNhanMt(m1, m2) {
    if (m1[0].length !== m2.length) {
        return '?'
    }
    var result = [];
    for (var i = 0; i < m1.length; i++) {
        result[i] = [];
        for (var j = 0; j < m2[0].length; j++) {
            var sum = 0;
            for (var k = 0; k < m1[0].length; k++) {
                sum += toNum(m1[i][k]) * toNum(m2[k][j])
            }
            result[i][j] = sum;
        }
    }
    return result;
}

function MtNhanSo(m, so) {

    return m.map(row => row.map(elem => elem * so))
}

function SoNhanMt(so, m) {

    return m.map(row => row.map(elem => elem * so))
}

function str2mt(str) {
    return str.split('\n').map(strRow => strRow.split(' '))
}