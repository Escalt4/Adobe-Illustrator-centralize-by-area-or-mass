// Получаем активный документ
var doc = app.activeDocument;

// Получаем выделенные объекты
var selectedItems = doc.selection;

// Массив для хранения центров масс и площадей каждого объекта
var centroids = [];
var areas = [];

// Перебираем все выделенные объекты
for (var i = 0; i < selectedItems.length; i++) {
    var currentItem = selectedItems[i];

    // Проверяем тип объекта (должен быть многоугольник)
    if (currentItem.typename === "PathItem" && currentItem.filled && currentItem.pathPoints.length > 2) {
        // Получаем координаты вершин многоугольника
        var polygonPoints = [];
        for (var j = 0; j < currentItem.pathPoints.length; j++) {
            var point = currentItem.pathPoints[j].anchor;
            polygonPoints.push(point);
        }

        // Вызываем функцию для нахождения центра масс
        var centroid = get_polygon_centroid(polygonPoints);

        // Добавляем центр масс текущего объекта в массив
        centroids.push(centroid);
		// Добавляем площадь текущего объекта в массив
        var area = currentItem.area;
        if (area < 0) area = -area;
        areas.push(area);
    }
}

// Получаем активный документ
var doc = app.activeDocument;
// Получаем размеры монтажной области
var artboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
var artboardWidth = artboard.artboardRect[2] - artboard.artboardRect[0];
var artboardHeight = artboard.artboardRect[1] - artboard.artboardRect[3];
// Получаем центр монтажной области
var artboardCentre = [artboardWidth / 2.0, artboardHeight / 2.0]

// Находим общий центр масс
var totalCentroid = calculateTotalCentroid(centroids);

var moveDistanceX =  artboardCentre[0]-totalCentroid[0]; 
var moveDistanceY = artboardCentre[1]-totalCentroid[1];

// Перебираем все выделенные объекты
for (var i = 0; i < selectedItems.length; i++) {
    var currentItem = selectedItems[i];

    // Проверяем тип объекта (должен быть многоугольник)
    if (currentItem.typename === "PathItem" && currentItem.filled && currentItem.pathPoints.length > 2) {
        currentItem.position = [currentItem.position[0] , currentItem.position[1] + moveDistanceY];
    }
}


// Функция для нахождения центра масс многоугольника
function get_polygon_centroid(pts) {
    var first = pts[0], last = pts[pts.length - 1];
    if (first[0] != last[0] || first[1] != last[1]) pts.push(first);
    var twicearea = 0,
        x = 0, y = 0,
        nPts = pts.length,
        p1, p2, f;
    for (var i = 0, j = nPts - 1; i < nPts; j = i++) {
        p1 = pts[i]; p2 = pts[j];
        f = p1[0] * p2[1] - p2[0] * p1[1];
        twicearea += f;
        x += (p1[0] + p2[0]) * f;
        y += (p1[1] + p2[1]) * f;
    }
    f = twicearea * 3;
    return [x / f, y / f];
}

// Функция для нахождения общего центра масс
function calculateTotalCentroid(centroids) {
    var totalX = 0;
    var totalY = 0;
    var totalArea = 0;

    for (var i = 0; i < centroids.length; i++) {
        totalX += centroids[i][0] * areas[i];
        totalY += centroids[i][1] * areas[i];
        totalArea += areas[i];
    }

    return [totalX / totalArea, totalY / totalArea];
}
