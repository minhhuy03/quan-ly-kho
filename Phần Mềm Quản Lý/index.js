// Biến để theo dõi trạng thái hiển thị danh sách sản phẩm
var productListVisible = false;

// Mảng để lưu trữ thông tin sản phẩm
var products = [];

// Biến để lưu trữ thông tin về hóa đơn nhập hàng
var importBills = [];

// Biến để theo dõi trạng thái hiển thị form tạo phiếu nhập
var receiptFormVisible = false;

// Mảng để lưu trữ thông tin về các phiếu nhập hàng
var receipts = [];

// Mảng để lưu trữ thông tin chi tiết các phiếu nhập hàng
var receiptDetails = [];

// Sự kiện xảy ra khi DOM đã được tải
document.addEventListener("DOMContentLoaded", function () {
    // Tạo một đối tượng XMLHttpRequest để tương tác với server
    var xhr = new XMLHttpRequest();

    // Xử lý sự kiện khi trạng thái của request thay đổi
    xhr.onreadystatechange = function () {
        // Kiểm tra nếu request đã hoàn thành và có mã trạng thái là 200 (OK)
        if (xhr.readyState == 4 && xhr.status == 200) {
            // Parse dữ liệu JSON từ response và gán cho mảng 'products'
            products = JSON.parse(xhr.responseText);
            // Khởi tạo ứng dụng sau khi có dữ liệu
            init();
        }
    };

    // Mở một kết nối đến server để lấy dữ liệu từ tệp JSON
    xhr.open("GET", "products.json", true);

    // Gửi request đến server
    xhr.send();
});

// Hàm khởi tạo ứng dụng sau khi có dữ liệu sản phẩm
function init() {
    // Hiển thị danh sách sản phẩm và điền các tùy chọn sản phẩm trong form
    viewProductList();
    populateProductOptions();
}

// Hàm điền tùy chọn sản phẩm trong form
function populateProductOptions() {
    // Lấy thẻ select có id là "productId" từ DOM
    var productSelect = document.getElementById("productId");

    // Lặp qua mảng sản phẩm và tạo các tùy chọn cho mỗi sản phẩm
    for (var i = 0; i < products.length; i++) {
        // Tạo một phần tử option
        var option = document.createElement("option");

        // Gán giá trị và văn bản cho option từ thông tin sản phẩm
        option.value = products[i].id;
        option.text = products[i].name;

        // Thêm option vào thẻ select
        productSelect.add(option);
    }
}

// Hàm chuyển đổi trạng thái hiển thị danh sách sản phẩm
function toggleProductList() {
    // Đảo ngược giá trị của biến productListVisible
    productListVisible = !productListVisible;

    // Ẩn hoặc hiển thị danh sách sản phẩm dựa vào giá trị mới của productListVisible
    toggleVisibility("list", productListVisible);

    // Nếu danh sách được hiển thị, thì gọi hàm để hiển thị lại danh sách sản phẩm
    if (productListVisible) {
        viewProductList();
    }
}

// Hàm ẩn hoặc hiển thị một phần tử trên trang web
function toggleVisibility(elementId, isVisible) {
    // Lấy phần tử từ DOM dựa trên id
    var element = document.getElementById(elementId);

    // Đặt thuộc tính display của phần tử dựa vào giá trị isVisible
    element.style.display = isVisible ? "table" : "none";
}

// Hàm hiển thị danh sách sản phẩm trên trang web
function viewProductList() {
    // Lấy bảng có id là "list" từ DOM
    var list = document.getElementById("list");

    // Sử dụng vòng lặp để xóa tất cả các dòng trong bảng (trừ dòng header)
    for (var i = list.rows.length - 1; i > 0; i--) {
        list.deleteRow(i);
    }

    // Lặp qua mảng sản phẩm và thêm các dòng mới vào bảng
    for (var i = 0; i < products.length; i++) {
        // Tạo một dòng mới trong bảng
        var row = list.insertRow(-1);

        // Thêm các ô dữ liệu cho mỗi sản phẩm vào dòng
        var idCell = row.insertCell(0);
        idCell.innerHTML = products[i].id;

        var nameCell = row.insertCell(1);
        nameCell.innerHTML = products[i].name;

        var idCategoryCell = row.insertCell(2)
        idCategoryCell.innerHTML = products[i].idCategory;

        var priceInputCell = row.insertCell(3);
        priceInputCell.innerHTML = products[i].priceInput;

        var priceOutputCell = row.insertCell(4);
        priceOutputCell.innerHTML = calculatePriceOutput(products[i].priceInput);
    }
}

// Hàm tính giá bán (priceOutput) dựa trên giá nhập (priceInput)
function calculatePriceOutput(priceInput) {
    var tax = priceInput * 0.1;
    var profit = priceInput * 0.3;
    return priceInput + tax + profit;
}

// Hàm hiển thị form tạo phiếu nhập
function createReceipt() {
    receiptFormVisible = true;
    toggleVisibility("receiptForm", receiptFormVisible);
}

// Hàm xử lý khi người dùng nhấn nút submit trên form tạo phiếu nhập
function submitReceipt() {
    // Lấy giá trị từ các trường input trong form
    var receiptId = document.getElementById("receiptId").value;
    var userName = document.getElementById("userName").value;
    var productId = document.getElementById("productId").value;
    var quantity = document.getElementById("quantity").value;
    var createdAt = new Date().toLocaleString();

    // Thêm thông tin phiếu nhập vào bảng tham chiếu
    receipts.push({
        id: receiptId,
        userName: userName,
        quantity: quantity,
        total: calculateTotal(quantity, productId), // Gọi hàm tính tổng
        createdAt: createdAt
    });

    // Thêm thông tin chi tiết phiếu nhập vào bảng tham chiếu
    var selectedProduct = products.find(p => p.id === productId);
    receiptDetails.push({
        id: receiptDetails.length + 1,
        idReceipt: receiptId,
        idProduct: productId,
        name: selectedProduct.name,
        idCategory: selectedProduct.idCategory,
        priceInput: selectedProduct.priceInput,
        priceOutput: calculatePriceOutput(selectedProduct.priceInput),
        quantity: quantity
    });

    // Cập nhật bảng tham chiếu
    updateReferenceTables();
}

// Hàm tính tổng giá trị của phiếu nhập dựa trên số lượng và giá nhập của sản phẩm
function calculateTotal(quantity, productId) {
    var selectedProduct = products.find(p => p.id === productId);
    return quantity * selectedProduct.priceInput;
}

// Hàm cập nhật bảng tham chiếu sau khi có sự thay đổi
function updateReferenceTables() {
    // Hiển thị lại bảng thông tin các phiếu nhập và chi tiết phiếu nhập
    viewReceipts();
    viewReceiptDetails();
}

// Hàm hiển thị thông tin các phiếu nhập
function viewReceipts() {
    var receiptList = document.getElementById("receiptList");
    clearTable(receiptList);

    // Duyệt qua mảng các phiếu nhập và thêm thông tin vào bảng
    for (var i = 0; i < receipts.length; i++) {
        var row = receiptList.insertRow(-1);
        row.insertCell(0).innerHTML = receipts[i].id;
        row.insertCell(1).innerHTML = receipts[i].userName;
        row.insertCell(2).innerHTML = receipts[i].quantity;
        row.insertCell(3).innerHTML = receipts[i].total;
        row.insertCell(4).innerHTML = receipts[i].createdAt;
    }
}

// Hàm hiển thị thông tin chi tiết của các phiếu nhập
function viewReceiptDetails() {
    var receiptDetailList = document.getElementById("receiptDetailList");
    clearTable(receiptDetailList);

    // Duyệt qua mảng chi tiết phiếu nhập và thêm thông tin vào bảng
    for (var i = 0; i < receiptDetails.length; i++) {
        var row = receiptDetailList.insertRow(-1);
        row.insertCell(0).innerHTML = receiptDetails[i].id;
        row.insertCell(1).innerHTML = receiptDetails[i].idReceipt;
        row.insertCell(2).innerHTML = receiptDetails[i].idProduct;
        row.insertCell(3).innerHTML = receiptDetails[i].name;
        row.insertCell(4).innerHTML = receiptDetails[i].idCategory;
        row.insertCell(5).innerHTML = receiptDetails[i].priceInput;
        row.insertCell(6).innerHTML = receiptDetails[i].priceOutput;
        row.insertCell(7).innerHTML = receiptDetails[i].quantity;
    }
}

// Hàm hiển thị danh sách sản phẩm theo ngày
function listItemsByDate() {
    // Đặt trạng thái hiển thị của danh sách theo ngày là true
    var itemListByDateVisible = true;

    // Ẩn hoặc hiển thị danh sách theo ngày dựa vào trạng thái mới
    toggleVisibility("itemListByDate", itemListByDateVisible);

    // Nếu danh sách được hiển thị, thì gọi hàm để hiển thị lại danh sách
    if (itemListByDateVisible) {
        viewItemListByDate();
    }
}

// Hàm hiển thị danh sách sản phẩm theo ngày
function viewItemListByDate() {
    var itemListByDateTable = document.getElementById("itemListByDateTable");
    clearTable(itemListByDateTable);

    // Đối tượng để lưu trữ số lượng sản phẩm theo mã sản phẩm
    var itemQuantities = {};

    // Duyệt qua danh sách chi tiết phiếu nhập và tính tổng số lượng cho mỗi sản phẩm
    for (var i = 0; i < receiptDetails.length; i++) {
        var receiptDetail = receiptDetails[i];
        var createdAt = getReceiptCreatedAt(receiptDetail.idReceipt);

        // Nếu chưa có sản phẩm này trong đối tượng, tạo mới
        if (!itemQuantities[receiptDetail.idProduct]) {
            itemQuantities[receiptDetail.idProduct] = {
                name: receiptDetail.name,
                quantity: 0
            };
        }

        // Cộng dồn số lượng sản phẩm
        itemQuantities[receiptDetail.idProduct].quantity += parseInt(receiptDetail.quantity);
    }

    // Hiển thị thông tin trong bảng
    for (var itemId in itemQuantities) {
        var item = itemQuantities[itemId];
        var row = itemListByDateTable.insertRow(-1);
        row.insertCell(0).innerHTML = itemId;
        row.insertCell(1).innerHTML = item.name;
        row.insertCell(2).innerHTML = item.quantity;
        row.insertCell(3).innerHTML = getCurrentDate(); // Sử dụng hàm getCurrentDate để lấy ngày hiện tại
    }
}

// Hàm lấy ngày tạo của một phiếu nhập dựa trên id phiếu nhập
function getReceiptCreatedAt(receiptId) {
    var receipt = receipts.find(r => r.id === receiptId);
    return receipt ? receipt.createdAt : '';
}

// Hàm lấy ngày hiện tại dưới định dạng chuỗi
function getCurrentDate() {
    var currentDate = new Date();
    return currentDate.toLocaleDateString();
}

// Hàm xóa tất cả các dòng trong một bảng (trừ dòng header)
function clearTable(table) {
    var rowCount = table.rows.length;
    // Sử dụng vòng lặp từ rowCount - 1 để 1 để xóa tất cả các dòng, không xóa dòng header
    for (var i = rowCount - 1; i >= 1; i--) {
        table.deleteRow(i);
    }
}
  
// Hàm hiển thị thông tin tồn kho
function viewStock() {
    // Đặt trạng thái hiển thị của bảng tồn kho là true
    var stockListVisible = true;

    // Ẩn hoặc hiển thị bảng tồn kho dựa vào trạng thái mới
    toggleVisibility("stockList", stockListVisible);
    toggleVisibility("stockReceiptList", stockListVisible);

    // Nếu bảng tồn kho được hiển thị, thì gọi hàm để hiển thị lại bảng tồn kho và danh sách phiếu nhập tồn kho
    if (stockListVisible) {
        viewStockList();
        viewStockReceiptList();
    }
}

// Hàm hiển thị bảng tồn kho
function viewStockList() {
    var stockListTable = document.getElementById("stockList");
    clearTable(stockListTable);

    // Duyệt qua mảng sản phẩm và thêm thông tin vào bảng tồn kho
    for (var i = 0; i < products.length; i++) {
        var row = stockListTable.insertRow(-1);
        row.insertCell(0).innerHTML = products[i].id;
        row.insertCell(1).innerHTML = products[i].name;
        row.insertCell(2).innerHTML = products[i].idCategory;
        row.insertCell(3).innerHTML = products[i].priceInput;
        row.insertCell(4).innerHTML = calculatePriceOutput(products[i].priceInput);
    }
}

// Hàm hiển thị danh sách phiếu nhập tồn kho
function viewStockReceiptList() {
    var stockReceiptListTable = document.getElementById("stockReceiptList");
    clearTable(stockReceiptListTable);

    // Duyệt qua mảng phiếu nhập và thêm thông tin vào bảng phiếu nhập tồn kho
    for (var i = 0; i < receipts.length; i++) {
        var row = stockReceiptListTable.insertRow(-1);
        row.insertCell(0).innerHTML = receipts[i].id;
        row.insertCell(1).innerHTML = receipts[i].userName;
        row.insertCell(2).innerHTML = calculateTotalQuantity(receipts[i].id);
        row.insertCell(3).innerHTML = calculateTotalPrice(receipts[i].id);
        row.insertCell(4).innerHTML = receipts[i].createdAt;
    }
}

// Hàm tính tổng số lượng sản phẩm trong một phiếu nhập
function calculateTotalQuantity(receiptId) {
    var totalQuantity = 0;
    // Lặp qua từng chi tiết phiếu nhập
    for (var i = 0; i < receiptDetails.length; i++) {
        // Kiểm tra xem chi tiết phiếu nhập có thuộc về receiptId đã chỉ định không
        if (receiptDetails[i].idReceipt === receiptId) {
            // Cộng dồn số lượng cho chi tiết phiếu nhập tương ứng
            totalQuantity += parseInt(receiptDetails[i].quantity);
        }
    }
    // Trả về tổng số lượng cho receiptId đã chỉ định
    return totalQuantity;
}

// Hàm tính tổng giá trị của sản phẩm trong một phiếu nhập
function calculateTotalPrice(receiptId) {
    var totalPrice = 0;
    // Lặp qua từng chi tiết phiếu nhập
    for (var i = 0; i < receiptDetails.length; i++) {
        // Kiểm tra xem chi tiết phiếu nhập có thuộc về receiptId đã chỉ định không
        if (receiptDetails[i].idReceipt === receiptId) {
            // Tính giá tổng cộng cho chi tiết phiếu nhập tương ứng
            totalPrice += parseInt(receiptDetails[i].quantity) * parseFloat(receiptDetails[i].priceInput);
        }
    }
    // Trả về giá tổng cộng cho receiptId đã chỉ định
    return totalPrice;
}
// Hàm xác nhận việc nhập kho
function enterWarehouse() {
    // Lấy mã phiếu nhập kho từ trường nhập liệu
    var warehouseId = document.getElementById("warehouseId").value;

    // Kiểm tra xem có phiếu nhập kho có mã tương ứng hay không
    var warehouseExists = receipts.some(r => r.id === warehouseId);

    // Nếu có phiếu nhập kho tương ứng, gọi hàm để hiển thị chi tiết phiếu nhập kho
    if (warehouseExists) {
        viewImportReceiptDetails(warehouseId);
    } else {
        // Nếu không tìm thấy, thông báo lỗi
        alert("Không tìm thấy phiếu nhập kho với mã " + warehouseId);
    }
}

// Hàm hiển thị chi tiết phiếu nhập kho
function viewImportReceiptDetails(warehouseId) {
    // Lấy reference đến bảng hiển thị chi tiết phiếu nhập kho từ mã HTML
    var warehouseDetailListTable = document.getElementById("warehouseDetailList");
    
    // Xóa nội dung hiện tại của bảng chi tiết phiếu nhập kho
    clearTable(warehouseDetailListTable);

    // Duyệt qua mảng chi tiết phiếu nhập và thêm thông tin vào bảng chi tiết phiếu nhập kho
    for (var i = 0; i < receiptDetails.length; i++) {
        // Kiểm tra xem chi tiết phiếu nhập có thuộc về phiếu nhập kho có mã tương ứng không
        if (receiptDetails[i].idReceipt === warehouseId) {
            var row = warehouseDetailListTable.insertRow(-1);
            row.insertCell(0).innerHTML = receiptDetails[i].idReceipt;
            row.insertCell(1).innerHTML = receiptDetails[i].idProduct;
            row.insertCell(2).innerHTML = receiptDetails[i].name;
            row.insertCell(3).innerHTML = receiptDetails[i].idCategory;
            row.insertCell(4).innerHTML = receiptDetails[i].priceInput;
            row.insertCell(5).innerHTML = receiptDetails[i].priceOutput;
            row.insertCell(6).innerHTML = receiptDetails[i].quantity;
            row.insertCell(7).innerHTML = getCurrentDate(); // Sử dụng hàm getCurrentDate để lấy ngày hiện tại
        }
    }
}

// Hàm cập nhật giá của sản phẩm
function updateProductPrices() {
    // Lấy giá trị mã sản phẩm và giá mới từ trường nhập liệu
    var updateProductId = document.getElementById("updateProductId").value;
    var updateProductPrice = document.getElementById("updateProductPrice").value;

    // Tìm sản phẩm cần cập nhật trong mảng sản phẩm
    var updatedProduct = products.find(p => p.id == updateProductId);

    // Nếu sản phẩm được tìm thấy
    if (updatedProduct) {
        // Cập nhật giá nhập của sản phẩm và tính lại giá bán
        updatedProduct.priceInput = parseFloat(updateProductPrice);
        updatedProduct.priceOutput = calculatePriceOutput(updatedProduct.priceInput);

        // Cập nhật bảng hiển thị danh sách sản phẩm
        viewProductList();
    } else {
        // Nếu không tìm thấy sản phẩm, thông báo lỗi
        alert("Không tìm thấy sản phẩm với ID " + updateProductId);
    }
}
//
// Biến để lưu trữ thông tin tồn kho
var stockProducts = [];

// Biến để lưu trữ thông tin phiếu nhập kho
var stockReceipts = [];

// Hàm xem kho
function viewWarehouse() {
    // Lấy reference đến bảng hiển thị sản phẩm tồn kho từ mã HTML
    var stockTable = document.getElementById("stockTable");

    // Xóa nội dung hiện tại của bảng sản phẩm tồn kho
    clearTable(stockTable);

    // Duyệt qua mảng sản phẩm tồn kho và thêm thông tin vào bảng
    for (var i = 0; i < stockProducts.length; i++) {
        var row = stockTable.insertRow(-1);
        row.insertCell(0).innerHTML = stockProducts[i].id;
        row.insertCell(1).innerHTML = stockProducts[i].name;
        row.insertCell(2).innerHTML = stockProducts[i].idCategory;
        row.insertCell(3).innerHTML = stockProducts[i].priceInput;
        row.insertCell(4).innerHTML = stockProducts[i].priceOutput;
    }

    // Lấy reference đến bảng hiển thị phiếu nhập kho từ mã HTML
    var stockReceiptTable = document.getElementById("stockReceiptTable");

    // Xóa nội dung hiện tại của bảng phiếu nhập kho
    clearTable(stockReceiptTable);

    // Duyệt qua mảng phiếu nhập kho và thêm thông tin vào bảng
    for (var i = 0; i < stockReceipts.length; i++) {
        var row = stockReceiptTable.insertRow(-1);
        row.insertCell(0).innerHTML = stockReceipts[i].id;
        row.insertCell(1).innerHTML = stockReceipts[i].idReceipt;
        row.insertCell(2).innerHTML = stockReceipts[i].idProduct;
        row.insertCell(3).innerHTML = stockReceipts[i].name;
        row.insertCell(4).innerHTML = stockReceipts[i].idCategory;
        row.insertCell(5).innerHTML = stockReceipts[i].priceInput;
        row.insertCell(6).innerHTML = stockReceipts[i].priceOutput;
        row.insertCell(7).innerHTML = stockReceipts[i].quantity;
    }
}

// Hàm xóa tất cả các dòng trong một bảng (trừ dòng header)
function clearTable(table) {
    var rowCount = table.rows.length;
    // Sử dụng vòng lặp từ rowCount - 1 để 1 để xóa tất cả các dòng, không xóa dòng header
    for (var i = rowCount - 1; i >= 1; i--) {
        table.deleteRow(i);
    }
}
//
// Biến để lưu trữ thông tin tồn kho
var stockProducts = [];

// Biến để lưu trữ thông tin phiếu nhập kho
var stockReceipts = [];

// Hàm hiển thị thông tin tồn kho và phiếu nhập kho
function viewWarehouse() {
    // Đặt trạng thái hiển thị của bảng tồn kho và danh sách phiếu nhập tồn kho là true
    var stockListVisible = true;

    // Ẩn hoặc hiển thị bảng tồn kho và danh sách phiếu nhập tồn kho dựa vào trạng thái mới
    toggleVisibility("stockList", stockListVisible);
    toggleVisibility("stockReceiptList", stockListVisible);

    // Nếu bảng tồn kho và danh sách phiếu nhập tồn kho được hiển thị, thì gọi hàm để hiển thị lại chúng
    if (stockListVisible) {
        viewStockList();
        viewStockReceiptList();
    }
}

// Hàm hiển thị bảng tồn kho
function viewStockList() {
    var stockListTable = document.getElementById("stockList");
    clearTable(stockListTable);

    // Duyệt qua mảng sản phẩm và thêm thông tin vào bảng tồn kho
    for (var i = 0; i < stockProducts.length; i++) {
        var row = stockListTable.insertRow(-1);
        row.insertCell(0).innerHTML = stockProducts[i].id;
        row.insertCell(1).innerHTML = stockProducts[i].name;
        row.insertCell(2).innerHTML = stockProducts[i].idCategory;
        row.insertCell(3).innerHTML = stockProducts[i].priceInput;
        row.insertCell(4).innerHTML = stockProducts[i].priceOutput;
    }
}
