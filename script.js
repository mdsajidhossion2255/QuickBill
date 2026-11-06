
/* =========================================
   QUICKBILL - RESTAURANT BILLING SOFTWARE
   Complete JavaScript Application
========================================= */

const DB = {
    foods: "qb_foods",
    bills: "qb_bills",
    settings: "qb_settings"
};

function loadData(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value ?? fallback;
    } catch {
        return fallback;
    }
}

function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

let foods = loadData(DB.foods, []);
let bills = loadData(DB.bills, []);
let settings = loadData(DB.settings, {
    name: "My Restaurant",
    address: "",
    phone: ""
});

let cart = [];
let discount = 0;
let currentPage = "dashboard";

const app = document.querySelector(".container");

function money(value) {
    return "৳ " + Number(value || 0).toFixed(2);
}

function today() {
    const d = new Date();
    return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0")
    ].join("-");
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function makeButton(label, action, extra = "") {
    return `<button type="button" data-action="${action}" ${extra}>${label}</button>`;
}

/* =========================================
   DASHBOARD
========================================= */

function showDashboard() {
    const dailyBills = bills.filter(b => b.date === today());

    const sales = dailyBills.reduce(
        (sum, bill) => sum + bill.total, 0
    );

    app.innerHTML = `
        <section class="welcome">
            <h1>স্বাগতম QuickBill-এ</h1>
            <p>আপনার রেস্টুরেন্টের বিল ও বিক্রির হিসাব</p>
        </section>

        <section class="dashboard">
            <div class="card">
                <h3>আজকের বিক্রি</h3>
                <h2>${money(sales)}</h2>
            </div>

            <div class="card">
                <h3>আজকের মোট বিল</h3>
                <h2>${dailyBills.length}</h2>
            </div>

            <div class="card">
                <h3>খাবারের আইটেম</h3>
                <h2>${foods.length}</h2>
            </div>
        </section>

        <section class="menu">
            <h2>সফটওয়্যার মেনু</h2>

            <div class="menu-grid">
                ${makeButton("＋ নতুন বিল তৈরি", "billing")}
                ${makeButton("খাবারের তালিকা", "foods")}
                ${makeButton("বিলের ইতিহাস", "history")}
                ${makeButton("দৈনিক রিপোর্ট", "reports")}
                ${makeButton("রেস্টুরেন্ট সেটিংস", "settings")}
            </div>
        </section>
    `;
}

/* =========================================
   FOOD MANAGEMENT
========================================= */

function showFoods() {
    app.innerHTML = `
        <h2>খাবারের তালিকা</h2>

        <form id="foodForm">
            <input name="name" placeholder="খাবারের নাম" required>

            <input name="price" type="number"
                min="0.01" step="0.01"
                placeholder="খাবারের দাম" required>

            <button type="submit">খাবার যোগ করুন</button>
        </form>

        <div class="menu">
            <h3>সকল খাবার (${foods.length})</h3>

            ${foods.length ? foods.map(food => `
                <div class="food-row">
                    <strong>${escapeHTML(food.name)}</strong>
                    <span>${money(food.price)}</span>

                    ${makeButton("সম্পাদনা", "edit-food",
                        `data-id="${food.id}"`)}

                    ${makeButton("ডিলিট", "delete-food",
                        `data-id="${food.id}"`)}
                </div>
            `).join("") : "<p>এখনো কোনো খাবার যোগ করা হয়নি।</p>"}
        </div>

        ${makeButton("← Dashboard", "dashboard")}
    `;
}

/* =========================================
   BILLING SYSTEM
========================================= */

function showBilling() {
    app.innerHTML = `
        <h2>নতুন বিল তৈরি</h2>

        <div class="menu">
            <label>খাবার নির্বাচন করুন</label>

            <select id="foodSelect">
                <option value="">খাবার নির্বাচন করুন</option>

                ${foods.map(food => `
                    <option value="${food.id}">
                        ${escapeHTML(food.name)} - ${money(food.price)}
                    </option>
                `).join("")}
            </select>

            <label>পরিমাণ</label>
            <input id="foodQty" type="number" min="1" value="1">

            ${makeButton("বিলে যোগ করুন", "add-cart")}
        </div>

        <h3>বিলের তালিকা</h3>

        <div id="cartList"></div>

        <div class="menu">
            <label>ডিসকাউন্ট (৳)</label>

            <input id="discount" type="number"
                min="0" step="0.01" value="${discount}">

            <h3 id="subtotal">সর্বমোট: ${money(cartSubtotal())}</h3>
            <h3 id="billTotal">পরিশোধযোগ্য: ${money(cartTotal())}</h3>

            ${makeButton("বিল সংরক্ষণ করুন", "save-bill")}
            ${makeButton("বিল খালি করুন", "clear-cart")}
        </div>

        ${makeButton("← Dashboard", "dashboard")}
    `;

    updateCart();
}

function cartSubtotal() {
    return cart.reduce(
        (sum, item) => sum + item.price * item.qty, 0
    );
}

function cartTotal() {
    return Math.max(0, cartSubtotal() - discount);
}

function updateCart() {
    const list = document.getElementById("cartList");

    if (!list) return;

    list.innerHTML = cart.length ? cart.map(item => `
        <div class="food-row">
            <strong>${escapeHTML(item.name)}</strong>

            <span>${item.qty} × ${money(item.price)}</span>

            <strong>${money(item.qty * item.price)}</strong>

            ${makeButton("বাদ দিন", "remove-cart",
                `data-id="${item.id}"`)}
        </div>
    `).join("") : "<p>বিলে কোনো খাবার যোগ করা হয়নি।</p>";

    document.getElementById("subtotal").textContent =
        "সর্বমোট: " + money(cartSubtotal());

    document.getElementById("billTotal").textContent =
        "পরিশোধযোগ্য: " + money(cartTotal());
}

/* =========================================
   BILL HISTORY
========================================= */

function showHistory() {
    app.innerHTML = `
        <h2>বিলের ইতিহাস</h2>

        ${bills.length ? bills.slice().reverse().map(bill => `
            <div class="card">
                <h3>বিল #${escapeHTML(bill.id)}</h3>

                <p>তারিখ: ${escapeHTML(bill.date)}</p>
                <p>খাবারের সংখ্যা: ${bill.items.length}</p>
                <p>ডিসকাউন্ট: ${money(bill.discount)}</p>

                <h2>${money(bill.total)}</h2>

                ${makeButton("বিল প্রিন্ট / PDF", "print-bill",
                    `data-id="${bill.id}"`)}
            </div>
        `).join("") : "<p>কোনো বিল পাওয়া যায়নি।</p>"}

        ${makeButton("← Dashboard", "dashboard")}
    `;
}

/* =========================================
   DAILY REPORT
========================================= */

function showReports() {
    const daily = bills.filter(b => b.date === today());

    const total = daily.reduce(
        (sum, bill) => sum + bill.total, 0
    );

    app.innerHTML = `
        <h2>দৈনিক রিপোর্ট</h2>

        <div class="card">
            <h3>তারিখ: ${today()}</h3>
            <h3>মোট বিল: ${daily.length}</h3>
            <h2>মোট বিক্রি: ${money(total)}</h2>
        </div>

        ${makeButton("← Dashboard", "dashboard")}
    `;
}

/* =========================================
   RESTAURANT SETTINGS
========================================= */

function showSettings() {
    app.innerHTML = `
        <h2>রেস্টুরেন্ট সেটিংস</h2>

        <form id="settingsForm">

            <label>রেস্টুরেন্টের নাম</label>
            <input name="name"
                value="${escapeHTML(settings.name)}" required>

            <label>ঠিকানা</label>
            <input name="address"
                value="${escapeHTML(settings.address)}">

            <label>ফোন নম্বর</label>
            <input name="phone"
                value="${escapeHTML(settings.phone)}">

            <button type="submit">তথ্য সংরক্ষণ করুন</button>
        </form>

        ${makeButton("← Dashboard", "dashboard")}
    `;
}

/* =========================================
   RECEIPT PRINT AND PDF
========================================= */

function printReceipt(bill) {
    const receipt = window.open("", "_blank");

    if (!receipt) {
        alert("প্রিন্ট উইন্ডো খোলা যায়নি। ব্রাউজারের পপ-আপ অনুমতি দিন।");
        return;
    }

    receipt.document.write(`
        <!DOCTYPE html>
        <html lang="bn">
        <head>
            <meta charset="UTF-8">
            <title>QuickBill Receipt</title>

            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    color: #111;
                }

                h2, .center {
                    text-align: center;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                th, td {
                    padding: 9px 5px;
                    border-bottom: 1px solid #ddd;
                    text-align: left;
                }

                .total {
                    text-align: right;
                    margin-top: 20px;
                }
            </style>
        </head>

        <body>
            <h2>${escapeHTML(settings.name)}</h2>

            <p class="center">${escapeHTML(settings.address)}</p>
            <p class="center">${escapeHTML(settings.phone)}</p>

            <hr>

            <p>বিল নম্বর: ${escapeHTML(bill.id)}</p>
            <p>তারিখ: ${escapeHTML(bill.date)}</p>

            <table>
                <tr>
                    <th>খাবার</th>
                    <th>পরিমাণ</th>
                    <th>মোট</th>
                </tr>

                ${bill.items.map(item => `
                    <tr>
                        <td>${escapeHTML(item.name)}</td>
                        <td>${item.qty}</td>
                        <td>${money(item.price * item.qty)}</td>
                    </tr>
                `).join("")}
            </table>

            <div class="total">
                <p>সর্বমোট: ${money(
                    bill.items.reduce(
                        (sum, item) => sum + item.price * item.qty, 0
                    )
                )}</p>

                <p>ডিসকাউন্ট: ${money(bill.discount)}</p>

                <h3>পরিশোধযোগ্য: ${money(bill.total)}</h3>
            </div>

            <p class="center">ধন্যবাদ, আবার আসবেন!</p>

            <script>
                window.onload = () => window.print();
            <\/script>
        </body>
        </html>
    `);

    receipt.document.close();
}

/* =========================================
   ALL BUTTON EVENTS
========================================= */

app.addEventListener("click", event => {
    const btn = event.target.closest("[data-action]");

    if (!btn) return;

    const action = btn.dataset.action;

    /* Navigation */

    if ([
        "dashboard", "foods", "billing",
        "history", "reports", "settings"
    ].includes(action)) {
        currentPage = action;
        render();
        return;
    }

    /* Add Food To Cart */

    if (action === "add-cart") {
        const id = document.getElementById("foodSelect").value;
        const qty = Number(document.getElementById("foodQty").value);

        const food = foods.find(f => f.id === id);

        if (!food || !Number.isInteger(qty) || qty < 1) {
            alert("সঠিক খাবার ও পরিমাণ নির্বাচন করুন।");
            return;
        }

        const existing = cart.find(item => item.id === id);

        if (existing) {
            existing.qty += qty;
        } else {
            cart.push({ ...food, qty });
        }

        updateCart();
        return;
    }

    /* Remove Cart Item */

    if (action === "remove-cart") {
        cart = cart.filter(item => item.id !== btn.dataset.id);
        updateCart();
        return;
    }

    /* Clear Cart */

    if (action === "clear-cart") {
        if (!confirm("বিলের সব খাবার মুছে ফেলবেন?")) return;

        cart = [];
        discount = 0;
        render();
        return;
    }

    /* Save Bill */

    if (action === "save-bill") {
        if (!cart.length) {
            alert("প্রথমে খাবার যোগ করুন।");
            return;
        }

        const bill = {
            id: Date.now(),
            date: today(),
            items: cart.map(item => ({ ...item })),
            discount,
            total: cartTotal()
        };

        bills.push(bill);
        saveData(DB.bills, bills);

        cart = [];
        discount = 0;

        alert("বিল সফলভাবে সংরক্ষণ হয়েছে!");

        currentPage = "history";
        render();
        return;
    }

    /* Edit Food */

    if (action === "edit-food") {
        const food = foods.find(f => f.id === btn.dataset.id);
        if (!food) return;

        const name = prompt("খাবারের নতুন নাম:", food.name);
        if (name === null) return;

        const price = prompt("নতুন দাম:", food.price);
        if (price === null) return;

        const newPrice = Number(price);

        if (!name.trim() || !Number.isFinite(newPrice) || newPrice <= 0) {
            alert("সঠিক নাম ও দাম লিখুন।");
            return;
        }

        food.name = name.trim();
        food.price = newPrice;

        saveData(DB.foods, foods);
        render();
        return;
    }

    /* Delete Food */

    if (action === "delete-food") {
        if (!confirm("এই খাবারটি মুছে ফেলবেন?")) return;

        foods = foods.filter(f => f.id !== btn.dataset.id);

        saveData(DB.foods, foods);
        render();
        return;
    }

    /* Print Saved Bill */

    if (action === "print-bill") {
        const bill = bills.find(
            b => String(b.id) === btn.dataset.id
        );

        if (bill) printReceipt(bill);
        return;
    }
});

/* =========================================
   FORM SUBMISSION
========================================= */

app.addEventListener("submit", event => {
    event.preventDefault();

    /* Add New Food */

    if (event.target.id === "foodForm") {
        const data = new FormData(event.target);

        const name = String(data.get("name")).trim();
        const price = Number(data.get("price"));

        if (!name || !Number.isFinite(price) || price <= 0) {
            alert("সঠিক খাবারের নাম ও দাম লিখুন।");
            return;
        }

        foods.push({
            id: String(Date.now()) + Math.random().toString(16).slice(2),
            name,
            price
        });

        saveData(DB.foods, foods);
        render();

        alert("খাবার সফলভাবে যোগ হয়েছে!");
        return;
    }

    /* Save Restaurant Settings */

    if (event.target.id === "settingsForm") {
        const data = new FormData(event.target);

        settings = {
            name: String(data.get("name")).trim(),
            address: String(data.get("address")).trim(),
            phone: String(data.get("phone")).trim()
        };

        saveData(DB.settings, settings);

        alert("রেস্টুরেন্টের তথ্য সংরক্ষণ হয়েছে!");
        render();
    }
});

/* =========================================
   DISCOUNT CALCULATION
========================================= */

app.addEventListener("input", event => {
    if (event.target.id !== "discount") return;

    discount = Math.max(0, Number(event.target.value) || 0);

    if (discount > cartSubtotal()) {
        discount = cartSubtotal();
        event.target.value = discount;
    }

    updateCart();
});

/* =========================================
   START APPLICATION
========================================= */

function render() {
    const pages = {
        dashboard: showDashboard,
        foods: showFoods,
        billing: showBilling,
        history: showHistory,
        reports: showReports,
        settings: showSettings
    };

    (pages[currentPage] || showDashboard)();
}

render();
