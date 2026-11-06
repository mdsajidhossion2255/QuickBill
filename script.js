/* ==================================
   QuickBill - Main Application
================================== */

const DB = {
    foods: "qb_foods",
    bills: "qb_bills",
    settings: "qb_settings"
};

const getData = (key, fallback) => {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
};

const saveData = (key, data) =>
    localStorage.setItem(key, JSON.stringify(data));

let foods = getData(DB.foods, []);
let bills = getData(DB.bills, []);
let settings = getData(DB.settings, {
    name: "My Restaurant",
    address: "",
    phone: ""
});

let cart = [];
let discount = 0;
let currentPage = "dashboard";

const app = document.querySelector(".container");

const money = amount =>
    "৳ " + Number(amount || 0).toFixed(2);

const today = () =>
    new Date().toLocaleDateString("en-CA");

const escapeHTML = value =>
    String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);

function button(text, action) {
    return `<button type="button" data-action="${action}">${text}</button>`;
}

function render() {
    if (currentPage === "dashboard") showDashboard();
    if (currentPage === "foods") showFoods();
    if (currentPage === "billing") showBilling();
    if (currentPage === "history") showHistory();
    if (currentPage === "reports") showReports();
    if (currentPage === "settings") showSettings();
}

/* Dashboard */

function showDashboard() {
    const dailyBills = bills.filter(b => b.date === today());
    const sales = dailyBills.reduce((sum, b) => sum + b.total, 0);

    app.innerHTML = `
        <section class="welcome">
            <h1>QuickBill Dashboard</h1>
            <p>আপনার রেস্টুরেন্টের আজকের হিসাব</p>
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
                ${button("＋ নতুন বিল তৈরি", "billing")}
                ${button("খাবারের তালিকা", "foods")}
                ${button("বিলের ইতিহাস", "history")}
                ${button("দৈনিক রিপোর্ট", "reports")}
                ${button("রেস্টুরেন্ট সেটিংস", "settings")}
            </div>
        </section>
    `;
}

/* Food Management */

function showFoods() {
    app.innerHTML = `
        <h2>খাবারের তালিকা</h2>

        <form id="foodForm">
            <input name="name" placeholder="খাবারের নাম" required>
            <input name="price" type="number" min="0.01"
                step="0.01" placeholder="দাম (৳)" required>
            <button type="submit">খাবার যোগ করুন</button>
        </form>

        <h3>সকল খাবার (${foods.length})</h3>

        <div class="menu">
            ${foods.length ? foods.map(food => `
                <div class="food-row">
                    <strong>${escapeHTML(food.name)}</strong>
                    <span>${money(food.price)}</span>
                    ${button("সম্পাদনা", "edit-food")}
                    ${button("ডিলিট", "delete-food")}
                    <input type="hidden" value="${food.id}">
                </div>
            `).join("") : "<p>এখনো কোনো খাবার যোগ করা হয়নি।</p>"}
        </div>

        ${button("← Dashboard", "dashboard")}
    `;
}

/* Billing */

function showBilling() {
    app.innerHTML = `
        <h2>নতুন বিল তৈরি</h2>

        <div class="menu">
            <label>খাবার নির্বাচন করুন</label>
            <select id="foodSelect">
                <option value="">খাবার নির্বাচন করুন</option>
                ${foods.map(f => `
                    <option value="${f.id}">
                        ${escapeHTML(f.name)} - ${money(f.price)}
                    </option>
                `).join("")}
            </select>

            <label>পরিমাণ</label>
            <input id="foodQty" type="number" min="1" value="1">

            <button type="button" data-action="add-cart">
                বিলের তালিকায় যোগ করুন
            </button>
        </div>

        <h3>বিলের তালিকা</h3>

        <div id="cartList"></div>

        <div class="menu">
            <label>ডিসকাউন্ট (৳)</label>
            <input id="discount" type="number" min="0"
                step="0.01" value="${discount}">

            <h3 id="billTotal">মোট: ${money(cartTotal())}</h3>

            <button type="button" data-action="save-bill">
                বিল সংরক্ষণ করুন
            </button>

            <button type="button" data-action="clear-cart">
                বিল মুছে ফেলুন
            </button>
        </div>

        ${button("← Dashboard", "dashboard")}
    `;

    updateCart();
}

function cartTotal() {
    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.qty, 0
    );

    return Math.max(0, subtotal - discount);
}

function updateCart() {
    const list = document.getElementById("cartList");
    if (!list) return;

    list.innerHTML = cart.length ? cart.map(item => `
        <div class="food-row">
            <strong>${escapeHTML(item.name)}</strong>
            <span>${item.qty} × ${money(item.price)}</span>
            <strong>${money(item.qty * item.price)}</strong>
            <button type="button" data-action="remove-cart"
                data-id="${item.id}">বাদ দিন</button>
        </div>
    `).join("") : "<p>বিলের তালিকা খালি।</p>";

    document.getElementById("billTotal").textContent =
        "মোট: " + money(cartTotal());
}

/* Bill History */

function showHistory() {
    app.innerHTML = `
        <h2>বিলের ইতিহাস</h2>

        ${bills.length ? bills.slice().reverse().map(b => `
            <div class="card">
                <strong>বিল #${escapeHTML(b.id)}</strong>
                <p>তারিখ: ${escapeHTML(b.date)}</p>
                <p>আইটেম: ${b.items.length}</p>
                <h3>${money(b.total)}</h3>
                <button type="button" data-action="print-bill"
                    data-id="${b.id}">প্রিন্ট / PDF</button>
            </div>
        `).join("") : "<p>কোনো বিল সংরক্ষণ করা হয়নি।</p>"}

        ${button("← Dashboard", "dashboard")}
    `;
}

/* Daily Report */

function showReports() {
    const daily = bills.filter(b => b.date === today());
    const total = daily.reduce((sum, b) => sum + b.total, 0);

    app.innerHTML = `
        <h2>দৈনিক রিপোর্ট</h2>

        <div class="card">
            <h3>তারিখ: ${today()}</h3>
            <h3>মোট বিল: ${daily.length}</h3>
            <h2>মোট বিক্রি: ${money(total)}</h2>
        </div>

        ${button("← Dashboard", "dashboard")}
    `;
}

/* Restaurant Settings */

function showSettings() {
    app.innerHTML = `
        <h2>রেস্টুরেন্ট সেটিংস</h2>

        <form id="settingsForm">
            <label>রেস্টুরেন্টের নাম</label>
            <input name="name" value="${escapeHTML(settings.name)}" required>

            <label>ঠিকানা</label>
            <input name="address" value="${escapeHTML(settings.address)}">

            <label>ফোন নম্বর</label>
            <input name="phone" value="${escapeHTML(settings.phone)}">

            <button type="submit">সেটিংস সংরক্ষণ করুন</button>
        </form>

        ${button("← Dashboard", "dashboard")}
    `;
}

/* Print Receipt / Save as PDF */

function printReceipt(bill) {
    const receipt = window.open("", "_blank");

    if (!receipt) {
        alert("প্রিন্ট উইন্ডো খুলতে পারেনি। পপ-আপ অনুমতি দিন।");
        return;
    }

    receipt.document.write(`
        <!DOCTYPE html>
        <html lang="bn">
        <head>
            <meta charset="UTF-8">
            <title>QuickBill Receipt</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h2, p { text-align: center; }
                table { width: 100%; border-collapse: collapse; }
                td, th { border-bottom: 1px solid #ccc; padding: 8px; }
                .total { text-align: right; margin-top: 20px; }
            </style>
        </head>
        <body>
            <h2>${escapeHTML(settings.name)}</h2>
            <p>${escapeHTML(settings.address)}</p>
            <p>${escapeHTML(settings.phone)}</p>
            <hr>
            <p>বিল #${escapeHTML(bill.id)}</p>
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
                <p>ডিসকাউন্ট: ${money(bill.discount)}</p>
                <h3>সর্বমোট: ${money(bill.total)}</h3>
            </div>

            <p>ধন্যবাদ, আবার আসবেন!</p>

            <script>
                window.onload = () => window.print();
            <\/script>
        </body>
        </html>
    `);

    receipt.document.close();
}

/* All Button Actions */

app.addEventListener("click", event => {
    const btn = event.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;

    if (["dashboard", "foods", "billing", "history",
         "reports", "settings"].includes(action)) {
        currentPage = action;
        render();
    }

    if (action === "add-cart") {
        const id = document.getElementById("foodSelect").value;
        const qty = Number(document.getElementById("foodQty").value);
        const food = foods.find(f => f.id === id);

        if (!food || !Number.isInteger(qty) || qty < 1) {
            alert("সঠিক খাবার ও পরিমাণ নির্বাচন করুন।");
            return;
        }

        const existing = cart.find(item => item.id === id);

        if (existing) existing.qty += qty;
        else cart.push({ ...food, qty });

        updateCart();
    }

    if (action === "remove-cart") {
        cart = cart.filter(item => item.id !== btn.dataset.id);
        updateCart();
    }

    if (action === "clear-cart") {
        cart = [];
        discount = 0;
        render();
    }

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
    }

    if (action === "edit-food") {
        const id = btn.nextElementSibling.nextElementSibling.value;
        const food = foods.find(f => f.id === id);
        if (!food) return;

        const name = prompt("নতুন খাবারের নাম:", food.name);
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
    }

    if (action === "delete-food") {
        const id = btn.nextElementSibling.value;

        if (!confirm("এই খাবারটি মুছে ফেলবেন?")) return;

        foods = foods.filter(f => f.id !== id);
        saveData(DB.foods, foods);
        render();
    }

    if (action === "print-bill") {
        const bill = bills.find(b => String(b.id) === btn.dataset.id);
        if (bill) printReceipt(bill);
    }
});

/* Form Actions */

app.addEventListener("submit", event => {
    event.preventDefault();

    if (event.target.id === "foodForm") {
        const data = new FormData(event.target);
        const name = String(data.get("name")).trim();
        const price = Number(data.get("price"));

        if (!name || !Number.isFinite(price) || price <= 0) {
            alert("সঠিক খাবারের নাম ও দাম দিন।");
            return;
        }

        foods.push({
            id: String(Date.now()),
            name,
            price
        });

        saveData(DB.foods, foods);
        render();
    }

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

/* Discount Update */

app.addEventListener("input", event => {
    if (event.target.id === "discount") {
        discount = Math.max(0, Number(event.target.value) || 0);
        updateCart();
    }
});

/* Start Application */

render();
