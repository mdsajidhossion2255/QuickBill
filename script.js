/* ==========================================
   QUICKBILL - RESTAURANT MANAGEMENT SOFTWARE
   Main JavaScript
========================================== */

"use strict";

/* ==========================================
   1. DATABASE
========================================== */

const DB_NAME = "QuickBillDatabase";
const DB_VERSION = 1;
const IMAGE_STORE = "images";

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


/* ==========================================
   2. DATABASE HELPERS
========================================== */

function load(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error("Database loading error:", error);
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    notify("Storage is full. Please backup your data.", "error");
    console.error(error);
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

function money(amount) {
  return "৳ " + Number(amount || 0).toFixed(2);
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
    "'": "&#039;"
  })[char]);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString(
    language === "bn" ? "bn-BD" : "en-US"
  );
}

function text(bn, en) {
  return language === "bn" ? bn : en;
}


/* ==========================================
   3. IMAGE DATABASE - INDEXEDDB
========================================== */

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB not supported"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = function () {
      const database = request.result;

      if (!database.objectStoreNames.contains(IMAGE_STORE)) {
        database.createObjectStore(IMAGE_STORE);
      }
    };

    request.onsuccess = function () {
      db = request.result;
      resolve(db);
    };

    request.onerror = function () {
      reject(request.error);
    };
  });
}

function saveImage(id, file) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("Database not ready"));
      return;
    }

    const transaction = db.transaction(IMAGE_STORE, "readwrite");
    transaction.objectStore(IMAGE_STORE).put(file, id);

    transaction.oncomplete = () => resolve(id);
    transaction.onerror = () => reject(transaction.error);
  });
}

function getImage(id) {
  return new Promise(resolve => {
    if (!db || !id) {
      resolve(null);
      return;
    }

    const request = db
      .transaction(IMAGE_STORE, "readonly")
      .objectStore(IMAGE_STORE)
      .get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => resolve(null);
  });
}

function deleteImage(id) {
  return new Promise(resolve => {
    if (!db || !id) {
      resolve();
      return;
    }

    const transaction = db.transaction(IMAGE_STORE, "readwrite");
    transaction.objectStore(IMAGE_STORE).delete(id);
    transaction.oncomplete = resolve;
    transaction.onerror = resolve;
  });
}

async function imageURL(id) {
  const image = await getImage(id);

  if (!image) return "";

  return URL.createObjectURL(image);
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


/* ==========================================
   4. LANGUAGE SYSTEM
========================================== */

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

function applyLanguage() {
  document.documentElement.lang = language;

  const selector = document.getElementById("languageSelect");

  if (selector) selector.value = language;

  document.querySelectorAll("[data-i18n]").forEach(element => {
    const key = element.dataset.i18n;
    if (translations[language][key]) {
      element.textContent = translations[language][key];
    }
  });

  const title = document.getElementById("pageTitle");

  if (title) {
    title.textContent = t(currentPage === "billing" ? "newBill" :
      currentPage === "foods" ? "foodMenu" :
      currentPage === "categories" ? "categories" :
      currentPage === "history" ? "billHistory" :
      currentPage === "reports" ? "reports" :
      currentPage === "settings" ? "settings" : "dashboard");
  }
}


/* ==========================================
   5. NOTIFICATION
========================================== */

function notify(message, type = "success") {
  const container = document.getElementById("toastContainer");

  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast" + (type === "error" ? " error" : "");
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}


/* ==========================================
   6. PAGE NAVIGATION
========================================== */

function navigate(page) {
  currentPage = page;

  document.querySelectorAll(".nav-link").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === page
    );
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

  document.getElementById("sidebar")?.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderPage(page) {
  switch (page) {
    case "billing":
      renderBilling();
      break;
    case "foods":
      renderFoods();
      break;
    case "categories":
      renderCategories();
      break;
    case "history":
      renderHistory();
      break;
    case "reports":
      renderReports();
      break;
    case "settings":
      renderSettings();
      break;
    default:
      navigate("dashboard");
  }
}


/* ==========================================
   7. DASHBOARD
========================================== */

function renderDashboard() {
  const todayBills = bills.filter(bill => bill.date === today());

  const sales = todayBills.reduce(
    (sum, bill) => sum + Number(bill.total || 0), 0
  );

  document.getElementById("todaySales").textContent = money(sales);

  document.getElementById("todayBills").textContent =
    todayBills.length;

  document.getElementById("totalFoods").textContent =
    foods.length;

  document.getElementById("totalCategories").textContent =
    categories.length;

  const recent = document.getElementById("recentBillsContainer");

  if (!recent) return;

  if (!bills.length) {
    recent.innerHTML = `
      <div class="empty-state">
        <span>🧾</span>
        <p>${t("noBills")}</p>
      </div>
    `;
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
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}


/* ==========================================
   8. CATEGORY MANAGEMENT
========================================== */

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

            <div class="category-image">
              ${escapeHTML(category.icon || "🍽️")}
            </div>

            <h3>${escapeHTML(category.name)}</h3>

            <p>
              ${foods.filter(food => food.categoryId === category.id).length}
              ${language === "bn" ? "টি খাবার" : "foods"}
            </p>

            <div class="category-actions">
              <button class="secondary-btn"
                data-action="edit-category"
                data-id="${escapeHTML(category.id)}">
                ${t("edit")}
              </button>

              <button class="danger-btn"
                data-action="delete-category"
                data-id="${escapeHTML(category.id)}">
                ${t("delete")}
              </button>
            </div>

          </div>
        `).join("")}
      </div>

      ${categories.length ? "" : `
        <div class="empty-state">
          <span>▤</span>
          <p>${t("noCategories")}</p>
        </div>
      `}

    </div>
  `;
}

function categoryModal(category = null) {
  editingCategoryId = category?.id || null;

  showModal(
    category ? t("edit") : t("addNewCategory"),
    `
      <form id="categoryForm">

        <div class="form-group">
          <label>${t("name")}</label>
          <input name="name" required maxlength="60"
            value="${escapeHTML(category?.name || "")}"
            placeholder="${t("name")}">
        </div>

        <div class="form-group">
          <label>${language === "bn" ? "আইকন (Emoji)" : "Icon (Emoji)"}</label>
          <input name="icon" maxlength="10"
            value="${escapeHTML(category?.icon || "🍽️")}">
        </div>

        <div class="form-actions">
          <button class="primary-btn" type="submit">
            ${t("save")}
          </button>
          <button class="secondary-btn" type="button"
            data-action="close-modal">
            ${t("cancel")}
          </button>
        </div>

      </form>
    `
  );
}

function saveCategory(form) {
  const data = new FormData(form);

  const name = String(data.get("name") || "").trim();
  const icon = String(data.get("icon") || "🍽️").trim();

  if (!name) return;

  if (categories.some(category =>
    category.name.toLowerCase() === name.toLowerCase() &&
    category.id !== editingCategoryId
  )) {
    notify("Category already exists", "error");
    return;
  }

  if (editingCategoryId) {
    const category = categories.find(
      item => item.id === editingCategoryId
    );

    if (category) {
      category.name = name;
      category.icon = icon;
    }
  } else {
    categories.push({
      id: uid(),
      name,
      icon
    });
  }

  save(KEYS.categories, categories);
  closeModal();
  renderCategories();
  notify(t("save"));
}

function removeCategory(id) {
  if (!confirm(t("confirmDelete"))) return;

  const hasFoods = foods.some(food => food.categoryId === id);

  if (hasFoods) {
    notify(
      language === "bn"
        ? "এই বিভাগে খাবার রয়েছে। আগে খাবারগুলো অন্য বিভাগে সরান।"
        : "This category contains foods. Move them first.",
      "error"
    );
    return;
  }

  categories = categories.filter(category => category.id !== id);

  save(KEYS.categories, categories);
  renderCategories();
  notify(t("delete"));
}


/* ==========================================
   9. FOOD MANAGEMENT
========================================== */

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
        <input id="foodSearch"
          placeholder="${t("search")}..."
          type="search">

        <select id="foodCategoryFilter">
          <option value="all">${t("categories")}</option>
          ${categories.map(category => `
            <option value="${escapeHTML(category.id)}">
              ${escapeHTML(category.name)}
            </option>
          `).join("")}
        </select>
      </div>

      <div class="food-grid" id="foodGrid"></div>

    </div>
  `;

  renderFoodCards();

  document.getElementById("foodSearch").addEventListener(
    "input", renderFoodCards
  );

  document.getElementById("foodCategoryFilter").addEventListener(
    "change", renderFoodCards
  );
}

async function renderFoodCards() {
  const grid = document.getElementById("foodGrid");

  if (!grid) return;

  const search = (
    document.getElementById("foodSearch")?.value || ""
  ).toLowerCase();

  const categoryId =
    document.getElementById("foodCategoryFilter")?.value || "all";

  const filtered = foods.filter(food => {
    const matchName = food.name.toLowerCase().includes(search);
    const matchCategory =
      categoryId === "all" || food.categoryId === categoryId;

    return matchName && matchCategory;
  });

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <span>🍛</span>
        <p>${t("noFoods")}</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(food => `
    <div class="food-card">
      <div class="food-image-placeholder"
        id="food-image-${escapeHTML(food.id)}">
        🍽️
      </div>

      <div class="food-card-body">
        <h3>${escapeHTML(food.name)}</h3>
        <p class="food-price">${money(food.price)}</p>

        <div class="food-card-actions">
          <button class="secondary-btn"
            data-action="edit-food"
            data-id="${escapeHTML(food.id)}">
            ${t("edit")}
          </button>

          <button class="danger-btn"
            data-action="delete-food"
            data-id="${escapeHTML(food.id)}">
            ${t("delete")}
          </button>
        </div>
      </div>
    </div>
  `).join("");

  for (const food of filtered) {
    if (!food.imageId) continue;

    const image = await imageURL(food.imageId);
    const holder = document.getElementById("food-image-" + food.id);

    if (holder && image) {
      const img = document.createElement("img");
      img.src = image;
      img.alt = food.name;
      img.className = "food-image";
      holder.replaceWith(img);
    }
  }
}

function foodModal(food = null) {
  editingFoodId = food?.id || null;
  selectedImage = null;

  showModal(
    food ? t("edit") : t("addNewFood"),
    `
      <form id="foodForm">

        <div class="form-group">
          <label>${t("name")}</label>
          <input name="name" required maxlength="100"
            value="${escapeHTML(food?.name || "")}">
        </div>

        <div class="form-group">
          <label>${t("price")}</label>
          <input name="price" type="number"
            min="0" step="0.01" required
            value="${food?.price ?? ""}">
        </div>

        <div class="form-group">
          <label>${t("category")}</label>
          <select name="categoryId" required>
            <option value="">${t("selectCategory")}</option>
            ${categories.map(category => `
              <option value="${escapeHTML(category.id)}"
                ${food?.categoryId === category.id ? "selected" : ""}>
                ${escapeHTML(category.name)}
              </option>
            `).join("")}
          </select>
        </div>

        <div class="form-group">
          <label>${t("image")}</label>

          <div class="image-upload">
            <span>📷 ${t("image")}</span>
            <input type="file" id="foodImage"
              accept="image/*">
            <img id="foodImagePreview"
              class="image-preview"
              src="${placeholderImage()}"
              alt="Preview">
          </div>
        </div>

        <div class="form-actions">
          <button class="primary-btn" type="submit">
            ${t("save")}
          </button>

          <button class="secondary-btn" type="button"
            data-action="close-modal">
            ${t("cancel")}
          </button>
        </div>

      </form>
    `
  );

  document.getElementById("foodImage").addEventListener(
    "change", previewFoodImage
  );

  if (food?.imageId) {
    const image = await imageURL(food.imageId);

    if (image) {
      document.getElementById("foodImagePreview").src = image;
    }
  }
}

function previewFoodImage(event) {
  const file = event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    notify("Please select an image", "error");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    notify("Image must be smaller than 5 MB", "error");
    event.target.value = "";
    return;
  }

  selectedImage = file;

  document.getElementById("foodImagePreview").src =
    URL.createObjectURL(file);
}

async function saveFood(form) {
  const data = new FormData(form);

  const name = String(data.get("name") || "").trim();
  const price = Number(data.get("price"));
  const categoryId = String(data.get("categoryId") || "");

  if (!name || !Number.isFinite(price) || price < 0 || !categoryId) {
    notify("Please enter valid food details", "error");
    return;
  }

  const oldFood = foods.find(food => food.id === editingFoodId);

  const food = {
    id: editingFoodId || uid(),
    name,
    price,
    categoryId,
    imageId: oldFood?.imageId || null
  };

  if (selectedImage) {
    const imageId = uid();
    await saveImage(imageId, selectedImage);
    food.imageId = imageId;

    if (oldFood?.imageId) {
      await deleteImage(oldFood.imageId);
    }
  }

  if (editingFoodId) {
    foods = foods.map(item =>
      item.id === editingFoodId ? food : item
    );
  } else {
    foods.push(food);
  }

  save(KEYS.foods, foods);
  closeModal();
  renderFoods();
  notify(t("save"));
}

async function removeFood(id) {
  if (!confirm(t("confirmDelete"))) return;

  const food = foods.find(item => item.id === id);

  if (food?.imageId) {
    await deleteImage(food.imageId);
  }

  foods = foods.filter(item => item.id !== id);

  save(KEYS.foods, foods);
  renderFoods();
  notify(t("delete"));
}


/* ==========================================
   10. BILLING SYSTEM
========================================== */

function renderBilling() {
  const root = document.getElementById("dynamicPage");

  selectedCategory = "all";

  root.innerHTML = `
    <div class="billing-layout">

      <div class="billing-products">

        <div class="card-header">
          <h3>${t("foodMenu")}</h3>
        </div>

        <input id="billingSearch"
          class="form-control"
          placeholder="${t("search")}..."
          type="search">

        <div class="billing-category-list"
          id="billingCategories"></div>

        <div class="billing-food-grid"
          id="billingFoodGrid"></div>

      </div>

      <div class="billing-cart">

        <div class="card-header">
          <h3>🧾 ${t("newBill")}</h3>
        </div>

        <div class="form-group">
          <label>${t("customer")}</label>
          <input id="customerName"
            placeholder="${t("optional")}">
        </div>

        <div id="cartItems"></div>

        <div class="form-group">
          <label>${t("discount")}</label>
          <input id="discountInput"
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
          <button class="primary-btn"
            data-action="save-bill">
            ${t("saveBill")}
          </button>

          <button class="secondary-btn"
            data-action="clear-cart">
            ${t("clear")}
          </button>
        </div>

      </div>

    </div>
  `;

  renderBillingCategories();
  renderBillingFoods();
  renderCart();

  document.getElementById("billingSearch").addEventListener(
    "input", renderBillingFoods
  );

  document.getElementById("discountInput").addEventListener(
    "input", renderCart
  );
}

function renderBillingCategories() {
  const container = document.getElementById("billingCategories");

  container.innerHTML = `
    <button class="${selectedCategory === "all" ? "active" : ""}"
      data-action="filter-category"
      data-id="all">
      ${language === "bn" ? "সব খাবার" : "All Foods"}
    </button>

    ${categories.map(category => `
      <button
        class="${selectedCategory === category.id ? "active" : ""}"
        data-action="filter-category"
        data-id="${escapeHTML(category.id)}">
        ${escapeHTML(category.icon || "🍽️")}
        ${escapeHTML(category.name)}
      </button>
    `).join("")}
  `;
}

async function renderBillingFoods() {
  const grid = document.getElementById("billingFoodGrid");

  if (!grid) return;

  const search = (
    document.getElementById("billingSearch")?.value || ""
  ).toLowerCase();

  const filtered = foods.filter(food => {
    const matchCategory =
      selectedCategory === "all" ||
      food.categoryId === selectedCategory;

    return matchCategory &&
      food.name.toLowerCase().includes(search);
  });

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <span>🍽️</span>
        <p>${t("noFoods")}</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(food => `
    <button class="billing-food-item"
      data-action="add-to-cart"
      data-id="${escapeHTML(food.id)}">

      <div class="food-placeholder">🍽️</div>

      <div>
        <h4>${escapeHTML(food.name)}</h4>
        <p>${money(food.price)}</p>
      </div>

    </button>
  `).join("");

  for (const food of filtered) {
    if (!food.imageId) continue;

    const url = await imageURL(food.imageId);

    const button = grid.querySelector(
      `[data-id="${CSS.escape(food.id)}"]`
    );

    const placeholder = button?.querySelector(".food-placeholder");

    if (placeholder && url) {
      const img = document.createElement("img");
      img.src = url;
      img.alt = food.name;
      button.insertBefore(img, button.firstElementChild);
      placeholder.remove();
    }
  }
}

function addToCart(id) {
  const food = foods.find(item => item.id === id);

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
      imageId: food.imageId
    });
  }

  renderCart();
}

function cartTotal() {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const input = document.getElementById("discountInput");
  const requestedDiscount = Number(input?.value || 0);

  const discount = Math.max(
    0,
    Math.min(subtotal, requestedDiscount)
  );

  return {
    subtotal,
    discount,
    total: subtotal - discount
  };
}

function renderCart() {
  const container = document.getElementById("cartItems");

  if (!container) return;

  if (!cart.length) {
    container.innerHTML = `
      <div class="empty-state">
        <span>🛒</span>
        <p>${t("noItems")}</p>
      </div>
    `;
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-item">

        <div class="cart-item-info">
          <h4>${escapeHTML(item.name)}</h4>
          <p>${money(item.price)} × ${item.quantity}</p>
        </div>

        <div class="quantity-control">
          <button data-action="decrease-item"
            data-id="${escapeHTML(item.foodId)}">−</button>

          <strong>${item.quantity}</strong>

          <button data-action="increase-item"
            data-id="${escapeHTML(item.foodId)}">+</button>
        </div>

        <button class="danger-btn"
          data-action="remove-item"
          data-id="${escapeHTML(item.foodId)}">
          ×
        </button>

      </div>
    `).join("");
  }

  const totals = cartTotal();

  document.getElementById("cartSubtotal").textContent =
    money(totals.subtotal);

  document.getElementById("cartDiscount").textContent =
    money(totals.discount);

  document.getElementById("cartTotal").textContent =
    money(totals.total);
}

function changeQuantity(id, amount) {
  const item = cart.find(item => item.foodId === id);

  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    cart = cart.filter(item => item.foodId !== id);
  }

  renderCart();
}

function clearCart() {
  if (!cart.length) return;

  if (!confirm(t("confirmDelete"))) return;

  cart = [];

  const discount = document.getElementById("discountInput");

  if (discount) discount.value = 0;

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
    customer: document.getElementById("customerName")?.value.trim() || "",
    items: cart.map(item => ({ ...item })),
    subtotal: totals.subtotal,
    discount: totals.discount,
    total: totals.total,
    language
  };

  bills.push(bill);

  if (!save(KEYS.bills, bills)) {
    bills.pop();
    return;
  }

  cart = [];

  notify(t("billSaved"));

  renderBilling();
}


/* ==========================================
   11. BILL HISTORY
========================================== */

function renderHistory() {
  const root = document.getElementById("dynamicPage");

  root.innerHTML = `
    <div class="content-card">

      <div class="card-header">
        <h3>${t("billHistory")}</h3>
      </div>

      <div class="filter-bar">
        <input type="date" id="historyDate">
        <input type="search" id="historySearch"
          placeholder="${t("search")}...">
      </div>

      <div id="historyTable"></div>

    </div>
  `;

  renderHistoryTable();

  document.getElementById("historyDate").addEventListener(
    "change", renderHistoryTable
  );

  document.getElementById("historySearch").addEventListener(
    "input", renderHistoryTable
  );
}

function renderHistoryTable() {
  const container = document.getElementById("historyTable");

  if (!container) return;

  const date = document.getElementById("historyDate").value;

  const search = document.getElementById("historySearch")
    .value.toLowerCase();

  const filtered = [...bills].reverse().filter(bill => {
    return (!date || bill.date === date) &&
      bill.id.toLowerCase().includes(search);
  });

  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty-state">
        <span>📋</span>
        <p>${t("noBills")}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
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
                <button class="outline-btn"
                  data-action="print-bill"
                  data-id="${escapeHTML(bill.id)}">
                  ${t("print")}
                </button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}


/* ==========================================
   12. SALES REPORT
========================================== */

function renderReports() {
  const root = document.getElementById("dynamicPage");

  const month = today().slice(0, 7);

  const monthlyBills = bills.filter(
    bill => bill.date.startsWith(month)
  );

  const monthlySales = monthlyBills.reduce(
    (sum, bill) => sum + Number(bill.total || 0), 0
  );

  const todayList = bills.filter(
    bill => bill.date === today()
  );

  const todaySales = todayList.reduce(
    (sum, bill) => sum + Number(bill.total || 0), 0
  );

  root.innerHTML = `
    <div class="content-card">

      <div class="card-header">
        <h3>${t("reportTitle")}</h3>
      </div>

      <div class="stats-grid">

        <div class="stat-card">
          <div class="stat-icon green">৳</div>
          <div>
            <p>${t("todaySales")}</p>
            <h2>${money(todaySales)}</h2>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon blue">📋</div>
          <div>
            <p>${t("todayBills")}</p>
            <h2>${todayList.length}</h2>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon orange">৳</div>
          <div>
            <p>${t("monthlySales")}</p>
            <h2>${money(monthlySales)}</h2>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon purple">🧾</div>
          <div>
            <p>${t("totalBills")}</p>
            <h2>${bills.length}</h2>
          </div>
        </div>

      </div>

      <h3 style="margin:25px 0 15px">
        ${t("recentBills")}
      </h3>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>${t("date")}</th>
              <th>${t("billNumber")}</th>
              <th>${t("total")}</th>
            </tr>
          </thead>

          <tbody>
            ${[...bills].reverse().map(bill => `
              <tr>
                <td>${formatDate(bill.createdAt)}</td>
                <td>${escapeHTML(bill.id)}</td>
                <td>${money(bill.total)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

    </div>
  `;
}


/* ==========================================
   13. RESTAURANT SETTINGS
========================================== */

function renderSettings() {
  const root = document.getElementById("dynamicPage");

  root.innerHTML = `
    <div class="settings-layout">

      <div class="settings-card">
        <h3>${t("restaurantSettings")}</h3>

        <form id="settingsForm">

          <div class="form-group">
            <label>${t("restaurantName")}</label>
            <input name="name" required
              value="${escapeHTML(settings.name || "")}">
          </div>

          <div class="form-group">
            <label>${t("address")}</label>
            <textarea name="address">${escapeHTML(settings.address || "")}</textarea>
          </div>

          <div class="form-group">
            <label>${t("phone")}</label>
            <input name="phone"
              value="${escapeHTML(settings.phone || "")}">
          </div>

          <div class="form-group">
            <label>${t("logo")}</label>
            <input type="file" id="restaurantLogo"
              accept="image/*">
            <img id="logoPreview"
              class="image-preview"
              src="${placeholderImage()}">
          </div>

          <button class="primary-btn" type="submit">
            ${t("saveSettings")}
          </button>

        </form>
      </div>


      <div class="settings-card">
        <h3>${t("language")}</h3>

        <div class="form-group">
          <label>${t("language")}</label>

          <select id="settingsLanguage">
            <option value="bn">বাংলা</option>
            <option value="en">English</option>
          </select>
        </div>

        <hr style="margin:20px 0;border:0;border-top:1px solid #e5e7eb">

        <h3>Data Management</h3>

        <div class="form-actions">
          <button class="success-btn"
            data-action="backup">
            ${t("backup")}
          </button>

          <button class="secondary-btn"
            data-action="restore">
            ${t("restore")}
          </button>
        </div>

        <input type="file" id="restoreFile"
          accept=".json,application/json"
          hidden>

      </div>

    </div>
  `;

  document.getElementById("settingsLanguage").value = language;

  document.getElementById("settingsLanguage").addEventListener(
    "change", event => changeLanguage(event.target.value)
  );

  document.getElementById("restaurantLogo").addEventListener(
    "change", previewRestaurantLogo
  );

  if (settings.logoId) {
    imageURL(settings.logoId).then(url => {
      if (url) {
        document.getElementById("logoPreview").src = url;
      }
    });
  }
}

function previewRestaurantLogo(event) {
  const file = event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/") ||
      file.size > 5 * 1024 * 1024) {
    notify("Invalid image or image too large", "error");
    event.target.value = "";
    return;
  }

  selectedImage = file;

  document.getElementById("logoPreview").src =
    URL.createObjectURL(file);
}

async function saveSettings(form) {
  const data = new FormData(form);

  settings.name = String(data.get("name") || "").trim();
  settings.address = String(data.get("address") || "").trim();
  settings.phone = String(data.get("phone") || "").trim();

  const file = document.getElementById("restaurantLogo")
    .files[0];

  if (file) {
    const imageId = uid();
    await saveImage(imageId, file);

    if (settings.logoId) {
      await deleteImage(settings.logoId);
    }

    settings.logoId = imageId;
  }

  if (!save(KEYS.settings, settings)) return;

  updateRestaurantIdentity();

  notify(t("save"));
}

function updateRestaurantIdentity() {
  const name = settings.name || "My Restaurant";

  document.getElementById("sidebarRestaurantName").textContent =
    name;

  document.getElementById("sidebarRestaurantAddress").textContent =
    settings.address || "Restaurant Address";

  document.getElementById("userAvatar").textContent =
    name.charAt(0).toUpperCase();

  if (settings.logoId) {
    imageURL(settings.logoId).then(url => {
      if (!url) return;

      const holder = document.getElementById("sidebarRestaurantLogo");

      holder.innerHTML = "";

      const img = document.createElement("img");
      img.src = url;
      img.alt = name;

      holder.appendChild(img);
    });
  } else {
    document.getElementById("sidebarRestaurantLogo").textContent = "🍽️";
  }
}


/* ==========================================
   14. LANGUAGE CHANGE
========================================== */

function changeLanguage(value) {
  if (!["bn", "en"].includes(value)) return;

  language = value;

  localStorage.setItem(KEYS.language, language);

  applyLanguage();
  navigate(currentPage);
}


/* ==========================================
   15. MODAL SYSTEM
========================================== */

function showModal(title, content) {
  const root = document.getElementById("modalRoot");

  root.innerHTML = `
    <div class="modal-overlay">

      <div class="modal-box">

        <div class="modal-header">
          <h3>${escapeHTML(title)}</h3>

          <button class="modal-close"
            data-action="close-modal">×</button>
        </div>

        ${content}

      </div>

    </div>
  `;
}

function closeModal() {
  document.getElementById("modalRoot").innerHTML = "";
  selectedImage = null;
}


/* ==========================================
   16. INVOICE / PRINT
========================================== */

function invoiceHTML(bill) {
  const restaurantName = settings.name || "My Restaurant";

  const invoiceLanguage = bill.language || language;

  const bn = invoiceLanguage === "bn";

  const label = {
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

  return `
    <div class="invoice-document">

      <div class="invoice-header">
        <h1>${escapeHTML(restaurantName)}</h1>

        <p>${escapeHTML(settings.address || "")}</p>
        <p>${escapeHTML(settings.phone || "")}</p>

        <h2>${label.invoice}</h2>
      </div>

      <div class="invoice-meta">
        <p>${label.date}: ${formatDate(bill.createdAt)}</p>
        <p>${t("billNumber")}: ${escapeHTML(bill.id)}</p>
        ${bill.customer
          ? `<p>${label.customer}: ${escapeHTML(bill.customer)}</p>`
          : ""}
      </div>

      <table class="invoice-table">
        <thead>
          <tr>
            <th>${label.item}</th>
            <th>${label.quantity}</th>
            <th>${label.price}</th>
            <th>${label.total}</th>
          </tr>
        </thead>

        <tbody>
          ${bill.items.map(item => `
            <tr>
              <td>${escapeHTML(item.name)}</td>
              <td>${item.quantity}</td>
              <td>${money(item.price)}</td>
              <td>${money(item.price * item.quantity)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div class="invoice-total">
        <p>${label.subtotal}: ${money(bill.subtotal)}</p>
        <p>${label.discount}: ${money(bill.discount)}</p>
        <h2>${label.grand}: ${money(bill.total)}</h2>
      </div>

      <div class="invoice-footer">
        <p>${label.thanks}</p>
      </div>

    </div>
  `;
}

function printBill(id) {
  const bill = bills.find(item => item.id === id);

  if (!bill) return;

  const area = document.getElementById("printArea");

  area.innerHTML = invoiceHTML(bill);

  const oldStyle = document.getElementById("invoicePrintStyle");

  if (oldStyle) oldStyle.remove();

  const style = document.createElement("style");

  style.id = "invoicePrintStyle";

  style.textContent = `
    @media print {
      body * { visibility: hidden !important; }

      #printArea, #printArea * {
        visibility: visible !important;
      }

      #printArea {
        display: block !important;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        padding: 10mm;
        background: white;
        color: #111;
      }

      .invoice-document {
        font-family: Arial, "Noto Sans Bengali", sans-serif;
        max-width: 750px;
        margin: auto;
      }

      .invoice-header {
        text-align: center;
        margin-bottom: 25px;
      }

      .invoice-header h1 {
        font-size: 25px;
        margin-bottom: 8px;
      }

      .invoice-header h2 {
        margin-top: 15px;
      }

      .invoice-meta {
        margin: 20px 0;
        font-size: 12px;
      }

      .invoice-table {
        width: 100%;
        border-collapse: collapse;
      }

      .invoice-table th,
      .invoice-table td {
        border: 1px solid #ddd;
        padding: 10px;
        font-size: 12px;
      }

      .invoice-total {
        text-align: right;
        margin-top: 20px;
      }

      .invoice-footer {
        text-align: center;
        margin-top: 40px;
      }

      @page {
        size: auto;
        margin: 10mm;
      }
    }
  `;

  document.head.appendChild(style);

  window.print();
}


/* ==========================================
   17. BACKUP & RESTORE
========================================== */

function downloadBackup() {
  const backup = {
    version: 1,
    createdAt: new Date().toISOString(),
    foods,
    categories,
    bills,
    settings,
    language
  };

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json" }
  );

  downloadBlob(
    blob,
    "QuickBill-Backup-" + today() + ".json"
  );
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function restoreBackup(file) {
  const reader = new FileReader();

  reader.onload = function () {
    try {
      const backup = JSON.parse(reader.result);

      if (!Array.isArray(backup.foods) ||
          !Array.isArray(backup.bills) ||
          !Array.isArray(backup.categories)) {
        throw new Error("Invalid backup");
      }

      if (!confirm(
        language === "bn"
          ? "বর্তমান তথ্য পরিবর্তন করে Backup Restore করবেন?"
          : "Replace current data with this backup?"
      )) return;

      foods = backup.foods;
      bills = backup.bills;
      categories = backup.categories;
      settings = backup.settings || {};

      saveAll();

      if (backup.language) {
        language = backup.language;
        localStorage.setItem(KEYS.language, language);
      }

      notify("Backup restored");

      updateRestaurantIdentity();
      navigate("dashboard");

    } catch (error) {
      notify("Invalid backup file", "error");
    }
  };

  reader.readAsText(file);
}


/* ==========================================
   18. EVENT DELEGATION
========================================== */

document.addEventListener("click", async function (event) {

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
      const category = categories.find(item => item.id === id);
      if (category) categoryModal(category);
      break;
    }

    case "delete-category":
      removeCategory(id);
      break;

    case "add-food":
      if (!categories.length) {
        notify(t("noCategories"), "error");
        return;
      }
      foodModal();
      break;

    case "edit-food": {
      const food = foods.find(item => item.id === id);
      if (food) foodModal(food);
      break;
    }

    case "delete-food":
      removeFood(id);
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
      cart = cart.filter(item => item.foodId !== id);
      renderCart();
      break;

    case "clear-cart":
      clearCart();
      break;

    case "save-bill":
      saveBill();
      break;

    case "print-bill":
      printBill(id);
      break;

    case "backup":
      downloadBackup();
      break;

    case "restore":
      document.getElementById("restoreFile").click();
      break;

  }

});


/* ==========================================
   19. FORM EVENTS
========================================== */

document.addEventListener("submit", async function (event) {

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


/* ==========================================
   20. OTHER EVENTS
========================================== */

document.getElementById("languageSelect")
  ?.addEventListener("change", event => {
    changeLanguage(event.target.value);
  });

document.getElementById("menuToggle")
  ?.addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });

document.getElementById("restoreFile")
  ?.addEventListener("change", event => {
    const file = event.target.files[0];

    if (file) restoreBackup(file);

    event.target.value = "";
  });

document.getElementById("currentYear").textContent =
  new Date().getFullYear();


/* ==========================================
   21. INITIALIZATION
========================================== */

async function initializeQuickBill() {

  try {
    await openDatabase();
  } catch (error) {
    console.error("Image database error:", error);
    notify("Image storage could not be initialized", "error");
  }

  if (!Array.isArray(foods)) foods = [];
  if (!Array.isArray(categories)) categories = [];
  if (!Array.isArray(bills)) bills = [];

  applyLanguage();
  updateRestaurantIdentity();

  navigate("dashboard");

}

initializeQuickBill();
