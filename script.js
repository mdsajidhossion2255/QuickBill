
/* =========================================
   QUICKBILL - MAIN JAVASCRIPT
   Version 2.1
========================================= */

"use strict";

/* 1. DATABASE */

const DB_NAME = "QuickBillDatabase";
const STORE_NAME = "images";

const KEYS = {
  foods: "qb_foods",
  categories: "qb_categories",
  bills: "qb_bills",
  settings: "qb_settings",
  language: "qb_language"
};

let db = null;

let foods = load(KEYS.foods, []);
let categories = load(KEYS.categories, []);
let bills = load(KEYS.bills, []);
let settings = load(KEYS.settings, {});

let language = localStorage.getItem(KEYS.language) || "bn";
let currentPage = "dashboard";
let cart = [];
let selectedCategory = "all";
let editingFoodId = null;
let editingCategoryId = null;
let selectedImage = null;

/* 2. HELPERS */

function load(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (error) {
    console.error(error);
    return fallback;
  }
}

function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    notify(text("ডিভাইসের স্টোরেজ পূর্ণ হয়েছে", "Storage is full"), "error");
    return false;
  }
}

function saveAll() {
  save(KEYS.foods, foods);
  save(KEYS.categories, categories);
  save(KEYS.bills, bills);
  save(KEYS.settings, settings);
}

function uid() {
  return "QB-" + Date.now() + "-" +
    Math.random().toString(36).slice(2, 8);
}

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

function formatDate(value) {
  return new Date(value).toLocaleDateString(
    language === "bn" ? "bn-BD" : "en-US"
  );
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function text(bn, en) {
  return language === "bn" ? bn : en;
}

/* 3. IMAGE DATABASE */

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB unavailable"));
      return;
    }

    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onerror = () => reject(request.error);
  });
}

function saveImage(id, file) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("Database unavailable"));
      return;
    }

    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(file, id);

    transaction.oncomplete = () => resolve(id);
    transaction.onerror = () => reject(transaction.error);
  });
}

function getImage(id) {
  return new Promise(resolve => {
    if (!db || !id) return resolve(null);

    const request = db.transaction(STORE_NAME, "readonly")
      .objectStore(STORE_NAME).get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => resolve(null);
  });
}

function deleteImage(id) {
  return new Promise(resolve => {
    if (!db || !id) return resolve();

    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(id);

    transaction.oncomplete = resolve;
    transaction.onerror = resolve;
  });
}

async function imageURL(id) {
  const image = await getImage(id);
  return image ? URL.createObjectURL(image) : "";
}

function placeholderImage() {
  return "data:image/svg+xml," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">
      <rect width="100%" height="100%" fill="#f1f5f9"/>
      <text x="50%" y="50%" text-anchor="middle"
        dominant-baseline="middle" font-size="45">🍽️</text>
    </svg>
  `);
}

/* 4. TRANSLATIONS */

const translations = {
  bn: {
    dashboard: "ড্যাশবোর্ড",
    newBill: "নতুন বিল",
    foodMenu: "খাবারের মেনু",
    categories: "খাবারের বিভাগ",
    billHistory: "বিলের ইতিহাস",
    reports: "বিক্রির রিপোর্ট",
    settings: "সেটিংস",
    mainMenu: "প্রধান মেনু",
    management: "ম্যানেজমেন্ট",
    todaySales: "আজকের বিক্রি",
    todayBills: "আজকের বিল",
    totalFoods: "মোট খাবার",
    totalCategories: "মোট বিভাগ",
    recentBills: "সাম্প্রতিক বিল",
    viewAll: "সব দেখুন",
    noBills: "এখনো কোনো বিল নেই",
    quickActions: "দ্রুত কাজ",
    addFood: "খাবার যোগ করুন",
    addCategory: "বিভাগ যোগ করুন",
    restaurantSettings: "রেস্টুরেন্ট সেটিংস",
    createBill: "নতুন বিল তৈরি করুন",
    save: "সংরক্ষণ করুন",
    cancel: "বাতিল",
    edit: "এডিট",
    delete: "মুছুন",
    name: "নাম",
    price: "দাম",
    image: "ছবি",
    category: "বিভাগ",
    add: "যোগ করুন",
    update: "আপডেট",
    search: "খুঁজুন",
    quantity: "পরিমাণ",
    subtotal: "সাবটোটাল",
    discount: "ডিসকাউন্ট",
    total: "সর্বমোট",
    remove: "সরান",
    clear: "মুছে ফেলুন",
    saveBill: "বিল সংরক্ষণ করুন",
    printBill: "প্রিন্ট / PDF",
    restaurantName: "রেস্টুরেন্টের নাম",
    address: "ঠিকানা",
    phone: "ফোন নম্বর",
    logo: "রেস্টুরেন্টের লোগো",
    selectCategory: "বিভাগ নির্বাচন করুন",
    noFoods: "কোনো খাবার পাওয়া যায়নি",
    noCategories: "কোনো বিভাগ নেই",
    billSaved: "বিল সংরক্ষণ হয়েছে",
    confirmDelete: "আপনি কি মুছে ফেলতে চান?",
    backup: "Backup ডাউনলোড",
    restore: "Backup Restore",
    date: "তারিখ",
    billNumber: "বিল নম্বর",
    action: "কাজ",
    print: "প্রিন্ট করুন",
    customer: "কাস্টমারের নাম",
    optional: "ঐচ্ছিক",
    dashboardSubtitle: "রেস্টুরেন্টের হিসাব",
    welcome: "QuickBill-এ স্বাগতম!",
    saveSettings: "সেটিংস সংরক্ষণ করুন",
    addNewCategory: "নতুন বিভাগ তৈরি করুন",
    addNewFood: "নতুন খাবার যোগ করুন",
    noItems: "বিলে কোনো খাবার নেই",
    reportTitle: "বিক্রির রিপোর্ট",
    today: "আজ",
    monthlySales: "এই মাসের বিক্রি",
    totalBills: "মোট বিল",
    language: "ভাষা"
  },

  en: {
    dashboard: "Dashboard",
    newBill: "New Bill",
    foodMenu: "Food Menu",
    categories: "Food Categories",
    billHistory: "Bill History",
    reports: "Sales Reports",
    settings: "Settings",
    mainMenu: "MAIN MENU",
    management: "MANAGEMENT",
    todaySales: "Today's Sales",
    todayBills: "Today's Bills",
    totalFoods: "Total Foods",
    totalCategories: "Total Categories",
    recentBills: "Recent Bills",
    viewAll: "View All",
    noBills: "No bills available yet",
    quickActions: "Quick Actions",
    addFood: "Add Food",
    addCategory: "Add Category",
    restaurantSettings: "Restaurant Settings",
    createBill: "Create New Bill",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    name: "Name",
    price: "Price",
    image: "Image",
    category: "Category",
    add: "Add",
    update: "Update",
    search: "Search",
    quantity: "Quantity",
    subtotal: "Subtotal",
    discount: "Discount",
    total: "Total",
    remove: "Remove",
    clear: "Clear",
    saveBill: "Save Bill",
    printBill: "Print / PDF",
    restaurantName: "Restaurant Name",
    address: "Address",
    phone: "Phone Number",
    logo: "Restaurant Logo",
    selectCategory: "Select Category",
    noFoods: "No foods found",
    noCategories: "No categories available",
    billSaved: "Bill saved successfully",
    confirmDelete: "Are you sure you want to delete?",
    backup: "Download Backup",
    restore: "Restore Backup",
    date: "Date",
    billNumber: "Bill Number",
    action: "Action",
    print: "Print",
    customer: "Customer Name",
    optional: "Optional",
    dashboardSubtitle: "Restaurant Overview",
    welcome: "Welcome to QuickBill!",
    saveSettings: "Save Settings",
    addNewCategory: "Create New Category",
    addNewFood: "Add New Food",
    noItems: "No items in the bill",
    reportTitle: "Sales Report",
    today: "Today",
    monthlySales: "Monthly Sales",
    totalBills: "Total Bills",
    language: "Language"
  }
};

function t(key) {
  return translations[language][key] || key;
}

/* 5. NOTIFICATIONS */

function notify(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast " + type;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* 6. SIDEBAR */

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const toggle = document.getElementById("menuToggle");

  sidebar?.classList.remove("active", "open");
  overlay?.classList.remove("active");
  document.body.classList.remove("sidebar-open");

  toggle?.setAttribute("aria-expanded", "false");
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const toggle = document.getElementById("menuToggle");

  if (!sidebar) return;

  const opening = !sidebar.classList.contains("active");

  sidebar.classList.toggle("active", opening);
  sidebar.classList.toggle("open", opening);
  overlay?.classList.toggle("active", opening);
  document.body.classList.toggle("sidebar-open", opening);

  toggle?.setAttribute("aria-expanded", String(opening));
}

/* 7. LANGUAGE */

function applyLanguage() {
  document.documentElement.lang = language;

  const selector = document.getElementById("languageSelect");
  if (selector) selector.value = language;

  document.querySelectorAll("[data-i18n]").forEach(element => {
    const key = element.dataset.i18n;
    if (translations[language][key]) {
      element.textContent = t(key);
    }
  });

  const title = document.getElementById("pageTitle");
  const subtitle = document.getElementById("pageSubtitle");

  const pageKeys = {
    dashboard: "dashboard",
    billing: "newBill",
    foods: "foodMenu",
    categories: "categories",
    history: "billHistory",
    reports: "reports",
    settings: "settings"
  };

  if (title) title.textContent = t(pageKeys[currentPage] || "dashboard");
  if (subtitle) subtitle.textContent = t("dashboardSubtitle");
}

function changeLanguage(value) {
  if (!["bn", "en"].includes(value)) return;

  language = value;
  localStorage.setItem(KEYS.language, language);

  applyLanguage();

  if (currentPage === "dashboard") {
    renderDashboard();
  } else {
    renderPage(currentPage);
  }
}

/* 8. NAVIGATION */

function navigate(page) {
  const allowed = [
    "dashboard", "billing", "foods",
    "categories", "history", "reports", "settings"
  ];

  if (!allowed.includes(page)) return;

  currentPage = page;

  document.querySelectorAll(".nav-link").forEach(button => {
    button.classList.toggle("active", button.dataset.page === page);
  });

  const dashboard = document.getElementById("dashboardPage");
  const dynamic = document.getElementById("dynamicPage");

  if (page === "dashboard") {
    dashboard.hidden = false;
    dynamic.hidden = true;
    renderDashboard();
  } else {
    dashboard.hidden = true;
    dynamic.hidden = false;
    renderPage(page);
  }

  applyLanguage();
  closeSidebar();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderPage(page) {
  const pages = {
    billing: renderBilling,
    foods: renderFoods,
    categories: renderCategories,
    history: renderHistory,
    reports: renderReports,
    settings: renderSettings
  };

  if (pages[page]) pages[page]();
}

/* 9. DASHBOARD */

function renderDashboard() {
  const todayBills = bills.filter(bill => bill.date === today());

  const sales = todayBills.reduce(
    (sum, bill) => sum + Number(bill.total || 0), 0
  );

  document.getElementById("todaySales").textContent = money(sales);
  document.getElementById("todayBills").textContent = todayBills.length;
  document.getElementById("totalFoods").textContent = foods.length;
  document.getElementById("totalCategories").textContent = categories.length;

  const recent = document.getElementById("recentBillsContainer");
  if (!recent) return;

  if (!bills.length) {
    recent.innerHTML = `
      <div class="empty-state">
        <span>🧾</span><p>${t("noBills")}</p>
      </div>`;
    return;
  }

  recent.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>${t("billNumber")}</th>
            <th>${t("date")}</th>
            <th>${t("total")}</th>
          </tr>
        </thead>
        <tbody>
          ${[...bills].reverse().slice(0, 5).map(bill => `
            <tr>
              <td>${escapeHTML(bill.id)}</td>
              <td>${formatDate(bill.createdAt)}</td>
              <td>${money(bill.total)}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

/* 10. CATEGORIES */

function renderCategories() {
  const root = document.getElementById("dynamicPage");

  root.innerHTML = `
    <div class="content-card">
      <div class="card-header">
        <h3>${t("categories")}</h3>
        <button class="primary-btn" data-action="add-category">
          + ${t("addCategory")}
        </button>
      </div>

      <div class="category-grid">
        ${categories.map(category => `
          <div class="category-card">
            <div class="category-image">${escapeHTML(category.icon || "🍽️")}</div>
            <h3>${escapeHTML(category.name)}</h3>
            <p>${foods.filter(f => f.categoryId === category.id).length}
              ${language === "bn" ? "টি খাবার" : "foods"}</p>
            <div class="category-actions">
              <button class="outline-btn" data-action="edit-category"
                data-id="${escapeHTML(category.id)}">${t("edit")}</button>
              <button class="danger-btn" data-action="delete-category"
                data-id="${escapeHTML(category.id)}">${t("delete")}</button>
            </div>
          </div>`).join("")}
      </div>

      ${categories.length ? "" : `
        <div class="empty-state"><span>▤</span><p>${t("noCategories")}</p></div>`}
    </div>`;
}

function categoryModal(category = null) {
  editingCategoryId = category?.id || null;

  showModal(
    category ? t("edit") : t("addNewCategory"),
    `
      <form id="categoryForm">
        <div class="form-group">
          <label>${t("name")}</label>
          <input class="form-control" name="name" required maxlength="60"
            value="${escapeHTML(category?.name || "")}">
        </div>

        <div class="form-group">
          <label>Icon (Emoji)</label>
          <input class="form-control" name="icon" maxlength="10"
            value="${escapeHTML(category?.icon || "🍽️")}">
        </div>

        <div class="form-actions">
          <button class="primary-btn" type="submit">${t("save")}</button>
          <button class="outline-btn" type="button"
            data-action="close-modal">${t("cancel")}</button>
        </div>
      </form>`
  );
}

function saveCategory(form) {
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const icon = String(data.get("icon") || "🍽️").trim();

  if (!name) return;

  if (categories.some(c =>
    c.name.toLowerCase() === name.toLowerCase() &&
    c.id !== editingCategoryId
  )) {
    notify(text("এই বিভাগ আগে থেকেই আছে", "Category already exists"), "error");
    return;
  }

  if (editingCategoryId) {
    const category = categories.find(c => c.id === editingCategoryId);
    if (category) {
      category.name = name;
      category.icon = icon;
    }
  } else {
    categories.push({ id: uid(), name, icon });
  }

  if (!save(KEYS.categories, categories)) return;

  closeModal();
  renderCategories();
  notify(t("save"));
}

function removeCategory(id) {
  if (!confirm(t("confirmDelete"))) return;

  if (foods.some(food => food.categoryId === id)) {
    notify(text(
      "এই বিভাগে খাবার রয়েছে। আগে খাবারগুলো সরান।",
      "This category contains foods. Move them first."
    ), "error");
    return;
  }

  categories = categories.filter(c => c.id !== id);
  save(KEYS.categories, categories);
  renderCategories();
  notify(t("delete"));
}

/* 11. FOOD MANAGEMENT */

function renderFoods() {
  const root = document.getElementById("dynamicPage");

  root.innerHTML = `
    <div class="content-card">
      <div class="card-header">
        <h3>${t("foodMenu")}</h3>
        <button class="primary-btn" data-action="add-food">
          + ${t("addFood")}
        </button>
      </div>

      <div class="filter-bar">
        <input class="form-control" id="foodSearch"
          placeholder="${t("search")}..." type="search">

        <select class="form-control" id="foodCategoryFilter">
          <option value="all">${t("categories")}</option>
          ${categories.map(c => `
            <option value="${escapeHTML(c.id)}">${escapeHTML(c.name)}</option>
          `).join("")}
        </select>
      </div>

      <div class="food-grid" id="foodGrid"></div>
    </div>`;

  document.getElementById("foodSearch").addEventListener("input", renderFoodCards);
  document.getElementById("foodCategoryFilter").addEventListener("change", renderFoodCards);

  renderFoodCards();
}

async function renderFoodCards() {
  const grid = document.getElementById("foodGrid");
  if (!grid) return;

  const search = document.getElementById("foodSearch").value.toLowerCase();
  const categoryId = document.getElementById("foodCategoryFilter").value;

  const filtered = foods.filter(food =>
    food.name.toLowerCase().includes(search) &&
    (categoryId === "all" || food.categoryId === categoryId)
  );

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state"><span>🍛</span><p>${t("noFoods")}</p></div>`;
    return;
  }

  grid.innerHTML = filtered.map(food => `
    <div class="food-card">
      <div class="food-image-placeholder" id="food-image-${escapeHTML(food.id)}">🍽️</div>
      <div class="food-card-body">
        <h3>${escapeHTML(food.name)}</h3>
        <p class="food-price">${money(food.price)}</p>
        <div class="food-card-actions">
          <button class="outline-btn" data-action="edit-food"
            data-id="${escapeHTML(food.id)}">${t("edit")}</button>
          <button class="danger-btn" data-action="delete-food"
            data-id="${escapeHTML(food.id)}">${t("delete")}</button>
        </div>
      </div>
    </div>`).join("");

  for (const food of filtered) {
    if (!food.imageId) continue;

    const url = await imageURL(food.imageId);
    const holder = document.getElementById("food-image-" + food.id);

    if (holder && url) {
      const img = document.createElement("img");
      img.src = url;
      img.alt = food.name;
      img.className = "food-image";
      holder.replaceWith(img);
    }
  }
}

function foodModal(food = null) {
  if (!categories.length) {
    notify(t("noCategories"), "error");
    return;
  }

  editingFoodId = food?.id || null;
  selectedImage = null;

  showModal(
    food ? t("edit") : t("addNewFood"),
    `
      <form id="foodForm">
        <div class="form-group">
          <label>${t("name")}</label>
          <input class="form-control" name="name" required maxlength="100"
            value="${escapeHTML(food?.name || "")}">
        </div>

        <div class="form-group">
          <label>${t("price")}</label>
          <input class="form-control" name="price" type="number"
            min="0" step="0.01" required value="${food?.price ?? ""}">
        </div>

        <div class="form-group">
          <label>${t("category")}</label>
          <select class="form-control" name="categoryId" required>
            <option value="">${t("selectCategory")}</option>
            ${categories.map(c => `
              <option value="${escapeHTML(c.id)}"
                ${food?.categoryId === c.id ? "selected" : ""}>
                ${escapeHTML(c.name)}
              </option>`).join("")}
          </select>
        </div>

        <div class="form-group">
          <label>${t("image")}</label>
          <div class="image-upload">
            <input type="file" id="foodImage" accept="image/*">
            <img id="foodImagePreview" class="image-preview"
              src="${placeholderImage()}" alt="Preview">
          </div>
        </div>

        <div class="form-actions">
          <button class="primary-btn" type="submit">${t("save")}</button>
          <button class="outline-btn" type="button"
            data-action="close-modal">${t("cancel")}</button>
        </div>
      </form>`
  );

  document.getElementById("foodImage").addEventListener("change", previewFoodImage);

  if (food?.imageId) {
    const url = await imageURL(food.imageId);
    const preview = document.getElementById("foodImagePreview");
    if (preview && url) preview.src = url;
  }
}

function previewFoodImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
    notify(text("ছবির সাইজ ৫ MB-এর মধ্যে হতে হবে", "Image must be under 5 MB"), "error");
    event.target.value = "";
    return;
  }

  selectedImage = file;
  document.getElementById("foodImagePreview").src = URL.createObjectURL(file);
}

async function saveFood(form) {
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const price = Number(data.get("price"));
  const categoryId = String(data.get("categoryId") || "");

  if (!name || !Number.isFinite(price) || price < 0 ||
      !categories.some(c => c.id === categoryId)) {
    notify(text("সঠিক তথ্য দিন", "Please enter valid details"), "error");
    return;
  }

  const oldFood = foods.find(f => f.id === editingFoodId);

  const food = {
    id: editingFoodId || uid(),
    name,
    price,
    categoryId,
    imageId: oldFood?.imageId || null
  };

  try {
    if (selectedImage) {
      const imageId = uid();
      await saveImage(imageId, selectedImage);
      food.imageId = imageId;

      if (oldFood?.imageId) await deleteImage(oldFood.imageId);
    }

    const updated = editingFoodId
      ? foods.map(f => f.id === editingFoodId ? food : f)
      : [...foods, food];

    if (!save(KEYS.foods, updated)) return;
    foods = updated;

    closeModal();
    renderFoods();
    notify(t("save"));
  } catch (error) {
    console.error(error);
    notify(text("খাবার সংরক্ষণ করা যায়নি", "Could not save food"), "error");
  }
}

async function removeFood(id) {
  if (!confirm(t("confirmDelete"))) return;

  const food = foods.find(f => f.id === id);
  if (food?.imageId) await deleteImage(food.imageId);

  foods = foods.filter(f => f.id !== id);
  save(KEYS.foods, foods);
  renderFoods();
  notify(t("delete"));
}

/* 12. BILLING */

function renderBilling() {
  const root = document.getElementById("dynamicPage");
  selectedCategory = "all";

  root.innerHTML = `
    <div class="billing-layout">
      <div class="billing-products">
        <div class="card-header"><h3>${t("foodMenu")}</h3></div>
        <input class="form-control" id="billingSearch"
          placeholder="${t("search")}..." type="search">
        <div class="billing-category-list" id="billingCategories"></div>
        <div class="billing-food-grid" id="billingFoodGrid"></div>
      </div>

      <div class="billing-cart">
        <div class="card-header"><h3>🧾 ${t("newBill")}</h3></div>

        <div class="form-group">
          <label>${t("customer")}</label>
          <input class="form-control" id="customerName"
            placeholder="${t("optional")}">
        </div>

        <div id="cartItems"></div>

        <div class="form-group">
          <label>${t("discount")}</label>
          <input class="form-control" id="discountInput"
            type="number" min="0" value="0">
        </div>

        <div class="cart-summary">
          <div class="summary-row">
            <span>${t("subtotal")}</span>
            <strong id="cartSubtotal">${money(0)}</strong>
          </div>
          <div class="summary-row">
            <span>${t("discount")}</span>
            <strong id="cartDiscount">${money(0)}</strong>
          </div>
          <div class="summary-row total">
            <span>${t("total")}</span>
            <strong id="cartTotal">${money(0)}</strong>
          </div>
        </div>

        <div class="form-actions">
          <button class="primary-btn" data-action="save-bill">${t("saveBill")}</button>
          <button class="outline-btn" data-action="clear-cart">${t("clear")}</button>
        </div>
      </div>
    </div>`;

  document.getElementById("billingSearch").addEventListener("input", renderBillingFoods);
  document.getElementById("discountInput").addEventListener("input", renderCart);

  renderBillingCategories();
  renderBillingFoods();
  renderCart();
}

function renderBillingCategories() {
  const root = document.getElementById("billingCategories");
  if (!root) return;

  root.innerHTML = `
    <button class="${selectedCategory === "all" ? "active" : ""}"
      data-action="filter-category" data-id="all">
      ${text("সব খাবার", "All Foods")}
    </button>
    ${categories.map(c => `
      <button class="${selectedCategory === c.id ? "active" : ""}"
        data-action="filter-category" data-id="${escapeHTML(c.id)}">
        ${escapeHTML(c.icon || "🍽️")} ${escapeHTML(c.name)}
      </button>`).join("")}`;
}

async function renderBillingFoods() {
  const grid = document.getElementById("billingFoodGrid");
  if (!grid) return;

  const search = document.getElementById("billingSearch").value.toLowerCase();

  const filtered = foods.filter(f =>
    (selectedCategory === "all" || f.categoryId === selectedCategory) &&
    f.name.toLowerCase().includes(search)
  );

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state"><span>🍽️</span><p>${t("noFoods")}</p></div>`;
    return;
  }

  grid.innerHTML = filtered.map(food => `
    <button class="billing-food-item" data-action="add-to-cart"
      data-id="${escapeHTML(food.id)}">
      <div class="food-placeholder">🍽️</div>
      <h4>${escapeHTML(food.name)}</h4>
      <p>${money(food.price)}</p>
    </button>`).join("");

  for (const food of filtered) {
    if (!food.imageId) continue;

    const url = await imageURL(food.imageId);
    const button = grid.querySelector(`[data-id="${CSS.escape(food.id)}"]`);
    const placeholder = button?.querySelector(".food-placeholder");

    if (placeholder && url) {
      const img = document.createElement("img");
      img.src = url;
      img.alt = food.name;
      placeholder.replaceWith(img);
    }
  }
}

function addToCart(id) {
  const food = foods.find(f => f.id === id);
  if (!food) return;

  const existing = cart.find(item => item.foodId === id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      foodId: id,
      name: food.name,
      price: food.price,
      quantity: 1,
      imageId: food.imageId || null
    });
  }

  renderCart();
}

function cartTotal() {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  const requested = Number(document.getElementById("discountInput")?.value || 0);
  const discount = Math.max(0, Math.min(subtotal, requested));

  return { subtotal, discount, total: subtotal - discount };
}

function renderCart() {
  const container = document.getElementById("cartItems");
  if (!container) return;

  if (!cart.length) {
    container.innerHTML = `<div class="empty-state"><span>🛒</span><p>${t("noItems")}</p></div>`;
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${escapeHTML(item.name)}</h4>
          <p>${money(item.price)} × ${item.quantity}</p>
        </div>
        <div class="quantity-control">
          <button data-action="decrease-item" data-id="${escapeHTML(item.foodId)}">−</button>
          <strong>${item.quantity}</strong>
          <button data-action="increase-item" data-id="${escapeHTML(item.foodId)}">+</button>
        </div>
        <button class="danger-btn" data-action="remove-item"
          data-id="${escapeHTML(item.foodId)}">×</button>
      </div>`).join("");
  }

  const totals = cartTotal();

  document.getElementById("cartSubtotal").textContent = money(totals.subtotal);
  document.getElementById("cartDiscount").textContent = money(totals.discount);
  document.getElementById("cartTotal").textContent = money(totals.total);
}

function changeQuantity(id, amount) {
  const item = cart.find(i => i.foodId === id);
  if (!item) return;

  item.quantity += amount;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.foodId !== id);
  }
  renderCart();
}

function clearCart() {
  if (!cart.length) return;
  if (!confirm(t("confirmDelete"))) return;

  cart = [];
  document.getElementById("discountInput").value = 0;
  renderCart();
}

function saveBill() {
  if (!cart.length) {
    notify(t("noItems"), "error");
    return;
  }

  const totals = cartTotal();

  const bill = {
    id: "INV-" + Date.now(),
    date: today(),
    createdAt: new Date().toISOString(),
    customer: document.getElementById("customerName").value.trim(),
    items: cart.map(item => ({ ...item })),
    subtotal: totals.subtotal,
    discount: totals.discount,
    total: totals.total,
    language
  };

  const updated = [...bills, bill];
  if (!save(KEYS.bills, updated)) return;

  bills = updated;
  cart = [];

  notify(t("billSaved"));
  renderBilling();
}

/* 13. BILL HISTORY */

function renderHistory() {
  document.getElementById("dynamicPage").innerHTML = `
    <div class="content-card">
      <div class="card-header"><h3>${t("billHistory")}</h3></div>
      <div class="filter-bar">
        <input class="form-control" type="date" id="historyDate">
        <input class="form-control" type="search" id="historySearch"
          placeholder="${t("search")}...">
      </div>
      <div id="historyTable"></div>
    </div>`;

  document.getElementById("historyDate").addEventListener("change", renderHistoryTable);
  document.getElementById("historySearch").addEventListener("input", renderHistoryTable);

  renderHistoryTable();
}

function renderHistoryTable() {
  const root = document.getElementById("historyTable");
  if (!root) return;

  const date = document.getElementById("historyDate").value;
  const search = document.getElementById("historySearch").value.toLowerCase();

  const filtered = [...bills].reverse().filter(bill =>
    (!date || bill.date === date) &&
    bill.id.toLowerCase().includes(search)
  );

  if (!filtered.length) {
    root.innerHTML = `<div class="empty-state"><span>📋</span><p>${t("noBills")}</p></div>`;
    return;
  }

  root.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>${t("billNumber")}</th>
            <th>${t("date")}</th>
            <th>${t("customer")}</th>
            <th>${t("total")}</th>
            <th>${t("action")}</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(bill => `
            <tr>
              <td>${escapeHTML(bill.id)}</td>
              <td>${formatDate(bill.createdAt)}</td>
              <td>${escapeHTML(bill.customer || "-")}</td>
              <td>${money(bill.total)}</td>
              <td>
                <button class="outline-btn" data-action="print-bill"
                  data-id="${escapeHTML(bill.id)}">${t("print")}</button>
              </td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

/* 14. REPORTS */

function renderReports() {
  const month = today().slice(0, 7);
  const monthlyBills = bills.filter(b => b.date.startsWith(month));
  const todayBills = bills.filter(b => b.date === today());

  const monthlySales = monthlyBills.reduce((s, b) => s + Number(b.total), 0);
  const dailySales = todayBills.reduce((s, b) => s + Number(b.total), 0);

  document.getElementById("dynamicPage").innerHTML = `
    <div class="content-card">
      <div class="card-header"><h3>${t("reportTitle")}</h3></div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon green">৳</div>
          <div><p>${t("todaySales")}</p><h2>${money(dailySales)}</h2></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue">📋</div>
          <div><p>${t("todayBills")}</p><h2>${todayBills.length}</h2></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange">৳</div>
          <div><p>${t("monthlySales")}</p><h2>${money(monthlySales)}</h2></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple">🧾</div>
          <div><p>${t("totalBills")}</p><h2>${bills.length}</h2></div>
        </div>
      </div>

      <h3 style="margin:20px 0 12px">${t("recentBills")}</h3>

      <div class="table-wrapper">
        <table>
          <thead><tr>
            <th>${t("date")}</th>
            <th>${t("billNumber")}</th>
            <th>${t("total")}</th>
          </tr></thead>
          <tbody>
            ${[...bills].reverse().map(b => `
              <tr>
                <td>${formatDate(b.createdAt)}</td>
                <td>${escapeHTML(b.id)}</td>
                <td>${money(b.total)}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>`;
}

/* 15. SETTINGS */

function renderSettings() {
  document.getElementById("dynamicPage").innerHTML = `
    <div class="settings-layout">

      <div class="settings-card">
        <h3>${t("restaurantSettings")}</h3>

        <form id="settingsForm">
          <div class="form-group">
            <label>${t("restaurantName")}</label>
            <input class="form-control" name="name" required
              value="${escapeHTML(settings.name || "")}">
          </div>

          <div class="form-group">
            <label>${t("address")}</label>
            <textarea class="form-control" name="address">${escapeHTML(settings.address || "")}</textarea>
          </div>

          <div class="form-group">
            <label>${t("phone")}</label>
            <input class="form-control" name="phone"
              value="${escapeHTML(settings.phone || "")}">
          </div>

          <div class="form-group">
            <label>${t("logo")}</label>
            <input type="file" id="restaurantLogo" accept="image/*">
            <img id="logoPreview" class="image-preview"
              src="${placeholderImage()}" alt="Logo">
          </div>

          <button class="primary-btn" type="submit">${t("saveSettings")}</button>
        </form>
      </div>

      <div class="settings-card">
        <h3>${t("language")}</h3>
        <div class="form-group">
          <label>${t("language")}</label>
          <select class="form-control" id="settingsLanguage">
            <option value="bn">বাংলা</option>
            <option value="en">English</option>
          </select>
        </div>

        <hr style="margin:20px 0;border:0;border-top:1px solid #e5e7eb">

        <h3>Data Management</h3>
        <div class="form-actions">
          <button class="success-btn" data-action="backup">${t("backup")}</button>
          <button class="outline-btn" data-action="restore">${t("restore")}</button>
        </div>

        <input type="file" id="restoreFile"
          accept=".json,application/json" hidden>
      </div>
    </div>`;

  document.getElementById("settingsLanguage").value = language;

  document.getElementById("settingsLanguage").addEventListener(
    "change", event => changeLanguage(event.target.value)
  );

  document.getElementById("restaurantLogo").addEventListener(
    "change", previewRestaurantLogo
  );

  if (settings.logoId) {
    imageURL(settings.logoId).then(url => {
      const preview = document.getElementById("logoPreview");
      if (preview && url) preview.src = url;
    });
  }
}

function previewRestaurantLogo(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
    notify(text("ছবির সাইজ ৫ MB-এর মধ্যে হতে হবে", "Image must be under 5 MB"), "error");
    event.target.value = "";
    return;
  }

  selectedImage = file;
  document.getElementById("logoPreview").src = URL.createObjectURL(file);
}

async function saveSettings(form) {
  const data = new FormData(form);

  const updated = {
    ...settings,
    name: String(data.get("name") || "").trim(),
    address: String(data.get("address") || "").trim(),
    phone: String(data.get("phone") || "").trim()
  };

  const file = document.getElementById("restaurantLogo").files[0];

  try {
    if (file) {
      const imageId = uid();
      await saveImage(imageId, file);

      if (settings.logoId) await deleteImage(settings.logoId);
      updated.logoId = imageId;
    }

    if (!save(KEYS.settings, updated)) return;

    settings = updated;
    updateRestaurantIdentity();
    notify(t("save"));
  } catch (error) {
    console.error(error);
    notify(text("সেটিংস সংরক্ষণ করা যায়নি", "Could not save settings"), "error");
  }
}

async function updateRestaurantIdentity() {
  const name = settings.name || "My Restaurant";

  const nameNode = document.getElementById("sidebarRestaurantName");
  const addressNode = document.getElementById("sidebarRestaurantAddress");
  const avatar = document.getElementById("userAvatar");
  const logo = document.getElementById("sidebarRestaurantLogo");

  if (nameNode) nameNode.textContent = name;
  if (addressNode) addressNode.textContent = settings.address || "Restaurant Address";
  if (avatar) avatar.textContent = name.charAt(0).toUpperCase();

  if (logo) {
    logo.innerHTML = "🍽️";

    if (settings.logoId) {
      const url = await imageURL(settings.logoId);
      if (url) {
        const img = document.createElement("img");
        img.src = url;
        img.alt = name;
        logo.replaceChildren(img);
      }
    }
  }
}

/* 16. MODAL */

function showModal(title, content) {
  document.getElementById("modalRoot").innerHTML = `
    <div class="modal-overlay">
      <div class="modal-box">
        <div class="modal-header">
          <h3>${escapeHTML(title)}</h3>
          <button class="modal-close" data-action="close-modal">×</button>
        </div>
        ${content}
      </div>
    </div>`;
}

function closeModal() {
  document.getElementById("modalRoot").innerHTML = "";
  selectedImage = null;
}

/* 17. INVOICE / PRINT */

async function invoiceHTML(bill) {
  const bn = (bill.language || language) === "bn";

  const labels = {
    invoice: bn ? "বিল" : "INVOICE",
    date: bn ? "তারিখ" : "Date",
    customer: bn ? "কাস্টমার" : "Customer",
    item: bn ? "খাবারের নাম" : "Item",
    quantity: bn ? "পরিমাণ" : "Quantity",
    price: bn ? "দাম" : "Price",
    total: bn ? "মোট" : "Total",
    subtotal: bn ? "সাবটোটাল" : "Subtotal",
    discount: bn ? "ডিসকাউন্ট" : "Discount",
    grand: bn ? "সর্বমোট" : "Grand Total",
    thanks: bn ? "আবার আসবেন!" : "Thank you for visiting!"
  };

  let logoHTML = "";

  if (settings.logoId) {
    const image = await getImage(settings.logoId);
    if (image) {
      const dataURL = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(image);
      });
      logoHTML = `<img src="${dataURL}" alt="Logo" style="max-width:90px;max-height:90px;display:block;margin:auto">`;
    }
  }

  const itemsHTML = await Promise.all(bill.items.map(async item => {
    let imageHTML = "";

    if (item.imageId) {
      const image = await getImage(item.imageId);
      if (image) {
        const dataURL = await new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(image);
        });
        imageHTML = `<img src="${dataURL}" style="width:45px;height:45px;object-fit:cover;vertical-align:middle;margin-right:8px">`;
      }
    }

    return `
      <tr>
        <td>${imageHTML}${escapeHTML(item.name)}</td>
        <td>${item.quantity}</td>
        <td>${money(item.price)}</td>
        <td>${money(item.price * item.quantity)}</td>
      </tr>`;
  }));

  return `
    <div class="invoice-document">
      <div class="invoice-header">
        ${logoHTML}
        <h1>${escapeHTML(settings.name || "My Restaurant")}</h1>
        <p>${escapeHTML(settings.address || "")}</p>
        <p>${escapeHTML(settings.phone || "")}</p>
        <h2>${labels.invoice}</h2>
      </div>

      <div class="invoice-meta">
        <p>${labels.date}: ${formatDate(bill.createdAt)}</p>
        <p>${bn ? "বিল নম্বর" : "Bill Number"}: ${escapeHTML(bill.id)}</p>
        ${bill.customer ? `<p>${labels.customer}: ${escapeHTML(bill.customer)}</p>` : ""}
      </div>

      <table class="invoice-table">
        <thead><tr>
          <th>${labels.item}</th>
          <th>${labels.quantity}</th>
          <th>${labels.price}</th>
          <th>${labels.total}</th>
        </tr></thead>
        <tbody>${itemsHTML.join("")}</tbody>
      </table>

      <div class="invoice-total">
        <p>${labels.subtotal}: ${money(bill.subtotal)}</p>
        <p>${labels.discount}: ${money(bill.discount)}</p>
        <h2>${labels.grand}: ${money(bill.total)}</h2>
      </div>

      <div class="invoice-footer"><p>${labels.thanks}</p></div>
    </div>`;
}

async function printBill(id) {
  const bill = bills.find(b => b.id === id);
  if (!bill) return;

  const area = document.getElementById("printArea");
  area.innerHTML = await invoiceHTML(bill);

  window.print();
}

/* 18. BACKUP & RESTORE WITH IMAGES */

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function dataURLToBlob(dataURL) {
  const parts = dataURL.split(",");
  const mime = parts[0].match(/:(.*?);/)[1];
  const binary = atob(parts[1]);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mime });
}

async function downloadBackup() {
  try {
    const imageIds = new Set();

    foods.forEach(f => { if (f.imageId) imageIds.add(f.imageId); });
    bills.forEach(b => b.items?.forEach(i => {
      if (i.imageId) imageIds.add(i.imageId);
    }));
    if (settings.logoId) imageIds.add(settings.logoId);

    const images = {};

    for (const id of imageIds) {
      const image = await getImage(id);
      if (image) images[id] = await fileToDataURL(image);
    }

    const backup = {
      version: 2,
      createdAt: new Date().toISOString(),
      foods,
      categories,
      bills,
      settings,
      language,
      images
    };

    const blob = new Blob(
      [JSON.stringify(backup, null, 2)],
      { type: "application/json" }
    );

    downloadBlob(blob, "QuickBill-Backup-" + today() + ".json");
    notify(text("Backup তৈরি হয়েছে", "Backup created"));
  } catch (error) {
    console.error(error);
    notify(text("Backup তৈরি করা যায়নি", "Backup failed"), "error");
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function restoreBackup(file) {
  try {
    const backup = JSON.parse(await file.text());

    if (!Array.isArray(backup.foods) ||
        !Array.isArray(backup.bills) ||
        !Array.isArray(backup.categories)) {
      throw new Error("Invalid backup");
    }

    if (!confirm(text(
      "বর্তমান তথ্য পরিবর্তন করে Backup Restore করবেন?",
      "Replace current data with this backup?"
    ))) return;

    if (backup.images && db) {
      for (const [id, dataURL] of Object.entries(backup.images)) {
        await saveImage(id, dataURLToBlob(dataURL));
      }
    }

    const oldData = {
      foods, categories, bills, settings, language
    };

    foods = backup.foods;
    categories = backup.categories;
    bills = backup.bills;
    settings = backup.settings || {};
    language = backup.language === "en" ? "en" : "bn";

    if (!save(KEYS.foods, foods) ||
        !save(KEYS.categories, categories) ||
        !save(KEYS.bills, bills) ||
        !save(KEYS.settings, settings)) {
      foods = oldData.foods;
      categories = oldData.categories;
      bills = oldData.bills;
      settings = oldData.settings;
      language = oldData.language;
      saveAll();
      throw new Error("Storage error");
    }

    localStorage.setItem(KEYS.language, language);

    updateRestaurantIdentity();
    navigate("dashboard");
    notify(text("Backup Restore সম্পন্ন হয়েছে", "Backup restored"));

  } catch (error) {
    console.error(error);
    notify(text("সঠিক Backup ফাইল নির্বাচন করুন", "Invalid backup file"), "error");
  }
}

/* 19. BUTTON EVENTS */

document.addEventListener("click", async event => {
  const pageButton = event.target.closest("[data-page]");

  if (pageButton) {
    navigate(pageButton.dataset.page);
    return;
  }

  const button = event.target.closest("[data-action]");
  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;

  switch (action) {
    case "add-category":
      categoryModal();
      break;

    case "edit-category": {
      const category = categories.find(c => c.id === id);
      if (category) categoryModal(category);
      break;
    }

    case "delete-category":
      removeCategory(id);
      break;

    case "add-food":
      foodModal();
      break;

    case "edit-food": {
      const food = foods.find(f => f.id === id);
      if (food) foodModal(food);
      break;
    }

    case "delete-food":
      await removeFood(id);
      break;

    case "close-modal":
      closeModal();
      break;

    case "filter-category":
      selectedCategory = id;
      renderBillingCategories();
      renderBillingFoods();
      break;

    case "add-to-cart":
      addToCart(id);
      break;

    case "increase-item":
      changeQuantity(id, 1);
      break;

    case "decrease-item":
      changeQuantity(id, -1);
      break;

    case "remove-item":
      cart = cart.filter(i => i.foodId !== id);
      renderCart();
      break;

    case "clear-cart":
      clearCart();
      break;

    case "save-bill":
      saveBill();
      break;

    case "print-bill":
      await printBill(id);
      break;

    case "backup":
      await downloadBackup();
      break;

    case "restore":
      document.getElementById("restoreFile")?.click();
      break;
  }
});

/* 20. FORM EVENTS */

document.addEventListener("submit", async event => {
  event.preventDefault();

  if (event.target.id === "categoryForm") {
    saveCategory(event.target);
  }

  if (event.target.id === "foodForm") {
    await saveFood(event.target);
  }

  if (event.target.id === "settingsForm") {
    await saveSettings(event.target);
  }
});

/* 21. OTHER EVENTS */

document.getElementById("languageSelect")?.addEventListener(
  "change", event => changeLanguage(event.target.value)
);

document.getElementById("menuToggle")?.addEventListener(
  "click", toggleSidebar
);

document.getElementById("sidebarOverlay")?.addEventListener(
  "click", closeSidebar
);

document.getElementById("restoreFile")?.addEventListener(
  "change", event => {
    const file = event.target.files[0];
    if (file) restoreBackup(file);
    event.target.value = "";
  }
);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeSidebar();
    closeModal();
  }
});

const yearElement = document.getElementById("currentYear");
if (yearElement) yearElement.textContent = new Date().getFullYear();

/* 22. INITIALIZATION */

async function initializeQuickBill() {
  try {
    await openDatabase();
  } catch (error) {
    console.error("Image database error:", error);
    notify(text(
      "ছবি সংরক্ষণের ব্যবস্থা চালু হয়নি",
      "Image storage could not be initialized"
    ), "error");
  }

  if (!Array.isArray(foods)) foods = [];
  if (!Array.isArray(categories)) categories = [];
  if (!Array.isArray(bills)) bills = [];

  if (!["bn", "en"].includes(language)) language = "bn";

  applyLanguage();
  await updateRestaurantIdentity();
  navigate("dashboard");
}

initializeQuickBill();
