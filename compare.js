document.addEventListener("DOMContentLoaded", () => {
    const compareList = JSON.parse(localStorage.getItem("compareList"));
    if (!compareList || compareList.length !== 2) {
        alert("Недостаточно автомобилей для сравнения");
        window.location.href = "index.html";
        return;
    }
    renderComparison(compareList);
});

function renderComparison(compareList) {
    const [car1, car2] = compareList;
    document.getElementById("comparison-table").innerHTML = generateComparisonTableHTML(car1, car2);
}

function generateComparisonTableHTML(car1, car2) {
    const rows = [
        generateRow(car1.title, car2.title),
        generateRow(car1.manufacturer, car2.manufacturer),
        generateRow(car1.description, car2.description),
        generateHighlightedRow(car1.price, car2.price, (a, b) => a < b),
        generateHighlightedRow(
            car1.availability,
            car2.availability,
            (a, b) => a === "В наличии" && b !== "В наличии"
        ),
        generateHighlightedRow(
            car1.star_rating,
            car2.star_rating,
            (a, b) => a > b
        ),
        generateRow(car1.category, car2.category),
        generateRow(car1.other_info || "Нет данных", car2.other_info || "Нет данных"),
        ...generateSpecificationsRows(car1.specifications, car2.specifications),
    ];

    return `
        <div class="comparison-table">
            <div class="row">
                <div class="cell">
                    <img src="${car1.cover_img || '/assets/no_img_car_cover.svg'}" alt="${car1.title}" class="car-image">
                </div>
                <div class="cell">
                    <img src="${car2.cover_img || '/assets/no_img_car_cover.svg'}" alt="${car2.title}" class="car-image">
                </div>
            </div>
            ${rows.join('')}
        </div>
    `;
}

function generateRow(value1, value2) {
    return `
        <div class="row">
            <div class="cell">${value1}</div>
            <div class="cell">${value2}</div>
        </div>
    `;
}

function generateHighlightedRow(value1, value2, compareFn) {
    const isHighlighted1 = compareFn(value1, value2);
    const isHighlighted2 = compareFn(value2, value1);

    return `
        <div class="row">
            <div class="cell" style="background-color: ${isHighlighted1 ? 'lightgreen' : 'transparent'};">
                ${value1 || "Нет данных"}
            </div>
            <div class="cell" style="background-color: ${isHighlighted2 ? 'lightgreen' : 'transparent'};">
                ${value2 || "Нет данных"}
            </div>
        </div>
    `;
}

function generateSpecificationsRows(specifications1 = [], specifications2 = []) {
    const maxLength = Math.max(specifications1.length, specifications2.length);
    const rows = [];

    for (let i = 0; i < maxLength; i++) {
        rows.push(
            generateRow(
                specifications1[i] || "Нет данных",
                specifications2[i] || "Нет данных"
            )
        );
    }

    return rows;
}

function formatPrice(price) {
    return price ? `${price.toLocaleString()} ₽` : "Нет данных";
}
