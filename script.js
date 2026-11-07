
/* =====================================================
   QUICKBILL - RESTAURANT MANAGEMENT SOFTWARE
   Version 3.0
   Storage: LocalStorage + IndexedDB
===================================================== */

"use strict";

/* =====================================================
   1. STORAGE CONFIGURATION
===================================================== */

const STORAGE = {
  foods: "qb_foods",
  categories: "qb_categories",
  bills: "qb_bills",
  settings: "qb_settings",
  language: "qb_language"
};

const DB_NAME = "QuickBillDatabase";
const DB_STORE = "images";

let currentPage = "dashboard";
let currentLanguage = localStorage.getItem(STORAGE.language) || "bn";
let cart = [];
let selectedCategory = "all";
let editingFoodId = null;
let editingCategoryId = null;

/* =====================================================
   2. TRANSLATIONS
===================================================== */

const translations = {
  bn: {
    brandSubtitle: "রেস্টুরেন্ট ম্যানেজার",
    mainMenu: "প্রধান মেনু",
    dashboard: "ড্যাশবোর্ড",
    dashboardSubtitle: "রেস্টুরেন্টের হিসাব",
    newBill: "নতুন বিল",
    foodMenu: "খাবারের মেনু",
    categories: "খাবারের বিভাগ",
    management: "ম্যানেজমেন্ট",
    billHistory: "বিলের ইতিহাস",
    reports: "বিক্রির রিপোর্ট",
    settings: "সেটিংস",
    welcome: "QuickBill-এ স্বাগতম!",
    welcomeText: "আপনার রেস্টুরেন্টের সম্পূর্ণ হিসাব পরিচালনা করুন।",
    createBill: "নতুন বিল তৈরি করুন",
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
    allRights: "সর্বস্বত্ব সংরক্ষিত",
    search: "খুঁজুন...",
    save: "সংরক্ষণ করুন",
    cancel: "বাতিল",
    edit: "সম্পাদনা",
    delete: "ডিলিট",
    add: "যোগ করুন",
    name: "নাম",
    price: "দাম",
    category: "বিভাগ",
    image: "ছবি",
    actions: "কাজ",
    noData: "কোনো তথ্য পাওয়া যায়নি",
    foodName: "খাবারের নাম",
    foodPrice: "খাবারের দাম",
    selectCategory: "বিভাগ নির্বাচন করুন",
    chooseImage: "ছবি নির্বাচন করুন",
    addNewFood: "নতুন খাবার যোগ করুন",
    editFood: "খাবার সম্পাদনা করুন",
    foodList: "খাবারের তালিকা",
    addNewCategory: "নতুন বিভাগ যোগ করুন",
    categoryName: "বিভাগের নাম",
    editCategory: "বিভাগ সম্পাদনা করুন",
    categoryList: "বিভাগের তালিকা",
    confirmDelete: "আপনি কি নিশ্চিতভাবে ডিলিট করতে চান?",
    cannotDeleteCategory: "এই বিভাগে খাবার রয়েছে। আগে খাবারগুলো অন্য বিভাগে সরান।",
    foodAdded: "খাবার যোগ হয়েছে",
    foodUpdated: "খাবার আপডেট হয়েছে",
    foodDeleted: "খাবার ডিলিট হয়েছে",
    categoryAdded: "বিভাগ যোগ হয়েছে",
    categoryUpdated: "বিভাগ আপডেট হয়েছে",
    categoryDeleted: "বিভাগ ডিলিট হয়েছে",
    enterName: "নাম লিখুন",
    enterPrice: "সঠিক দাম লিখুন",
    noCategory: "কোনো বিভাগ নেই",
    all: "সব",
    billing: "বিল তৈরি",
    selectFoods: "খাবার নির্বাচন করুন",
    cart: "বিলের তালিকা",
    quantity: "পরিমাণ",
    subtotal: "সাবটোটাল",
    discount: "ডিসকাউন্ট",
    total: "সর্বমোট",
    clearCart: "সব মুছুন",
    saveBill: "বিল সংরক্ষণ করুন",
    printBill: "বিল প্রিন্ট / PDF",
    emptyCart: "এখনো কোনো খাবার যোগ করা হয়নি",
    billSaved: "বিল সংরক্ষণ হয়েছে",
    addFoodFirst: "আগে খাবার যোগ করুন",
    discountAmount: "ডিসকাউন্টের পরিমাণ",
    billNumber: "বিল নম্বর",
    date: "তারিখ",
    customer: "কাস্টমারের নাম",
    optional: "ঐচ্ছিক",
    customerName: "কাস্টমারের নাম লিখুন",
    historyTitle: "বিলের ইতিহাস",
    billDetails: "বিলের বিস্তারিত",
    noHistory: "কোনো বিলের ইতিহাস নেই",
    searchBill: "বিল নম্বর বা নাম দিয়ে খুঁজুন",
    salesReport: "বিক্রির রিপোর্ট",
    today: "আজ",
    thisMonth: "এই মাস",
    totalSales: "মোট বিক্রি",
    totalBills: "মোট বিল",
    averageBill: "গড় বিল",
    restaurantInfo: "রেস্টুরেন্টের তথ্য",
    restaurantName: "রেস্টুরেন্টের নাম",
    address: "ঠিকানা",
    phone: "ফোন নম্বর",
    logo: "রেস্টুরেন্টের লোগো",
    language: "ভাষা",
    backup: "ব্যাকআপ ডাউনলোড",
    restore: "ব্যাকআপ রিস্টোর",
    settingsSaved: "সেটিংস সংরক্ষণ হয়েছে",
    backupDone: "ব্যাকআপ তৈরি হয়েছে",
    restoreDone: "ব্যাকআপ রিস্টোর হয়েছে",
    invalidBackup: "সঠিক ব্যাকআপ ফাইল নয়",
    noImage: "ছবি নেই",
    printFooter: "আমাদের রেস্টুরেন্টে আসার জন্য ধন্যবাদ",
    confirmBill: "বিল সংরক্ষণ করবেন?",
    billEmpty: "বিলে কোনো খাবার নেই",
    item: "আইটেম",
    unitPrice: "একক দাম",
    amount: "টাকা",
    close: "বন্ধ করুন",
    view: "দেখুন",
    export: "এক্সপোর্ট",
    noFoods: "কোনো খাবার যোগ করা হয়নি",
    noCategories: "কোনো বিভাগ যোগ করা হয়নি",
    deleteBill: "বিল ডিলিট করুন",
    billDeleted: "বিল ডিলিট হয়েছে",
    allTime: "সর্বমোট",
    currency: "৳"
  },

  en: {
    brandSubtitle: "Restaurant Manager",
    mainMenu: "MAIN MENU",
    dashboard: "Dashboard",
    dashboardSubtitle: "Restaurant overview",
    newBill: "New Bill",
    foodMenu: "Food Menu",
    categories: "Food Categories",
    management: "MANAGEMENT",
    billHistory: "Bill History",
    reports: "Sales Reports",
    settings: "Settings",
    welcome: "Welcome to QuickBill!",
    welcomeText: "Manage your restaurant operations easily.",
    createBill: "Create New Bill",
    todaySales: "Today's Sales",
    todayBills: "Today's Bills",
    totalFoods: "Total Foods",
    totalCategories: "Total Categories",
    recentBills: "Recent Bills",
    viewAll: "View All",
    noBills: "No bills yet",
    quickActions: "Quick Actions",
    addFood: "Add Food",
    addCategory: "Add Category",
    restaurantSettings: "Restaurant Settings",
    allRights: "All rights reserved",
    search: "Search...",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    add: "Add",
    name: "Name",
    price: "Price",
    category: "Category",
    image: "Image",
    actions: "Actions",
    noData: "No data found",
    foodName: "Food Name",
    foodPrice: "Food Price",
    selectCategory: "Select Category",
    chooseImage: "Choose Image",
    addNewFood: "Add New Food",
    editFood: "Edit Food",
    foodList: "Food List",
    addNewCategory: "Add New Category",
    categoryName: "Category Name",
    editCategory: "Edit Category",
    categoryList: "Category List",
    confirmDelete: "Are you sure you want to delete?",
    cannotDeleteCategory: "Move foods to another category before deleting this category.",
    foodAdded: "Food added successfully",
    foodUpdated: "Food updated successfully",
    foodDeleted: "Food deleted",
    categoryAdded: "Category added successfully",
    categoryUpdated: "Category updated",
    categoryDeleted: "Category deleted",
    enterName: "Enter a name",
    enterPrice: "Enter a valid price",
    noCategory: "No category",
    all: "All",
    billing: "Create Bill",
    selectFoods: "Select Foods",
    cart: "Bill Items",
    quantity: "Quantity",
    subtotal: "Subtotal",
    discount: "Discount",
    total: "Grand Total",
    clearCart: "Clear All",
    saveBill: "Save Bill",
    printBill: "Print / PDF",
    emptyCart: "No items added yet",
    billSaved: "Bill saved successfully",
    addFoodFirst: "Please add foods first",
    discountAmount: "Discount Amount",
    billNumber: "Bill Number",
    date: "Date",
    customer: "Customer",
    optional: "Optional",
    customerName: "Enter customer name",
    historyTitle: "Bill History",
    billDetails: "Bill Details",
    noHistory: "No bill history",
    searchBill: "Search by bill number or name",
    salesReport: "Sales Report",
    today: "Today",
    thisMonth: "This Month",
    totalSales: "Total Sales",
    totalBills: "Total Bills",
    averageBill: "Average Bill",
    restaurantInfo: "Restaurant Information",
    restaurantName: "Restaurant Name",
    address: "Address",
    phone: "Phone Number",
    logo: "Restaurant Logo",
    language: "Language",
    backup: "Download Backup",
    restore: "Restore Backup",
    settingsSaved: "Settings saved",
    backupDone: "Backup created",
    restoreDone: "Backup restored",
    invalidBackup: "Invalid backup file",
    noImage: "No image",
    printFooter: "Thank you for visiting our restaurant",
    confirmBill: "Save this bill?",
    billEmpty: "Your bill is empty",
    item: "Item",
    unitPrice: "Unit Price",
    amount: "Amount",
    close: "Close",
    view: "View",
    export: "Export",
    noFoods: "No foods added",
    noCategories: "No categories added",
    deleteBill: "Delete Bill",
    billDeleted: "Bill deleted",
    allTime: "All Time",
    currency: "৳"
  }
};

function t(key) {
  return translations[currentLanguage]?.[key] ??
    translations.en[key] ?? key;
}

function numberFormat(value) {
  const number = Number(value) || 0;

  return new Intl.NumberFormat(
    currentLanguage === "bn" ? "bn-BD" : "en-US",
    { maximumFractionDigits: 2 }
  ).format(number);
}

function money(value) {
  return `${t("currency")} ${numberFormat(value)}`;
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(
    currentLanguage === "bn" ? "bn-BD" : "en-GB",
    { day: "numeric", month: "short", year: "numeric" }
  );
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage;

  document.querySelectorAll("[data-i18n]").forEach(element => {
    const key = element.dataset.i18n;

    if (translations[currentLanguage][key]) {
      element.textContent = t(key);
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });

  const selector = document.getElementById("languageSelect");

  if (selector) selector.value = currentLanguage;

  renderPage();
}

/* =====================================================
   3. DATA HELPERS
===================================================== */

function getData(key, fallback = []) {
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

function getFoods() {
  return getData(STORAGE.foods);
}

function getCategories() {
  return getData(STORAGE.categories);
}

function getBills() {
  return getData(STORAGE.bills);
}

function getSettings() {
  return getData(STORAGE.settings, {});
}

function makeId() {
  return Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8);
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

function todayKey() {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function billDateKey(value) {
  const date = new Date(value);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

/* =====================================================
   4. INDEXED DB IMAGE STORAGE
===================================================== */

function openImageDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveImage(blob) {
  const db = await openImageDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DB_STORE, "readwrite");
    const id = makeId();

    transaction.objectStore(DB_STORE).put(blob, id);

    transaction.oncomplete = () => {
      db.close();
      resolve(id);
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

async function getImage(id) {
  if (!id) return "";

  try {
    const db = await openImageDB();

    return await new Promise(resolve => {
      const request = db.transaction(DB_STORE)
        .objectStore(DB_STORE)
        .get(id);

      request.onsuccess = () => {
        const blob = request.result;

        db.close();

        resolve(blob ? URL.createObjectURL(blob) : "");
      };

      request.onerror = () => {
        db.close();
        resolve("");
      };
    });
  } catch {
    return "";
  }
}

async function imageURL(id) {
  return await getImage(id);
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);

    reader.readAsDataURL(file);
  });
}

function dataURLToBlob(dataURL) {
  const parts = dataURL.split(",");
  const mime = parts[0].match(/:(.*?);/)[1];
  const binary = atob(parts[1]);
  const array = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }

  return new Blob([array], { type: mime });
}

/* =====================================================
   5. NOTIFICATIONS
===================================================== */

function toast(message, type = "success") {
  const container = document.getElementById("toastContainer");

  if (!container) return;

  const element = document.createElement("div");

  element.className = `toast ${type === "error" ? "error" : ""}`;
  element.textContent = message;

  container.appendChild(element);

  setTimeout(() => element.remove(), 3000);
}

/* =====================================================
   6. SIDEBAR
===================================================== */

function openSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const button = document.getElementById("menuToggle");

  sidebar?.classList.add("active");
  overlay?.classList.add("active");

  sidebar?.setAttribute("aria-hidden", "false");
  button?.setAttribute("aria-expanded", "true");

  document.body.style.overflow = "hidden";
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const button = document.getElementById("menuToggle");

  sidebar?.classList.remove("active", "open");
  overlay?.classList.remove("active");

  sidebar?.setAttribute("aria-hidden", "true");
  button?.setAttribute("aria-expanded", "false");

  document.body.style.overflow = "";
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");

  if (sidebar?.classList.contains("active")) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

/* =====================================================
   7. NAVIGATION
===================================================== */

const pageNames = {
  dashboard: "dashboard",
  billing: "billing",
  foods: "foodMenu",
  categories: "categories",
  history: "billHistory",
  reports: "reports",
  settings: "settings"
};

function navigate(page) {
  if (!pageNames[page]) return;

  currentPage = page;

  document.querySelectorAll(".nav-link").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === page
    );
  });

  const title = document.getElementById("pageTitle");

  if (title) {
    title.textContent = t(pageNames[page]);
  }

  const dashboard = document.getElementById("dashboardPage");
  const dynamic = document.getElementById("dynamicPage");

  if (dashboard) dashboard.hidden = page !== "dashboard";
  if (dynamic) dynamic.hidden = page === "dashboard";

  closeSidebar();
  renderPage();
}

function renderPage() {
  const dynamic = document.getElementById("dynamicPage");

  if (!dynamic) return;

  if (currentPage === "dashboard") {
    updateDashboard();
    return;
  }

  const renderers = {
    billing: renderBilling,
    foods: renderFoods,
    categories: renderCategories,
    history: renderHistory,
    reports: renderReports,
    settings: renderSettings
  };

  const renderer = renderers[currentPage];

  if (renderer) {
    renderer();
  }
}

/* =====================================================
   8. DASHBOARD
===================================================== */

function updateDashboard() {
  const foods = getFoods();
  const categories = getCategories();
  const bills = getBills();

  const todayBills = bills.filter(
    bill => billDateKey(bill.date) === todayKey()
  );

  const todaySales = todayBills.reduce(
    (sum, bill) => sum + Number(bill.total || 0), 0
  );

  setText("todaySales", money(todaySales));
  setText("todayBills", numberFormat(todayBills.length));
  setText("totalFoods", numberFormat(foods.length));
  setText("totalCategories", numberFormat(categories.length));

  const recent = document.getElementById("recentBillsContainer");

  if (!recent) return;

  const latest = [...bills]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (!latest.length) {
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
          ${latest.map(bill => `
            <tr>
              <td>${escapeHTML(bill.number)}</td>
              <td>${formatDate(bill.date)}</td>
              <td>${money(bill.total)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) element.textContent = value;
}

/* =====================================================
   9. MODAL SYSTEM
===================================================== */

function openModal(title, content) {
  const root = document.getElementById("modalRoot");

  if (!root) return;

  root.innerHTML = `
    <div class="modal-overlay" data-action="close-modal">
      <div class="modal-box" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3>${escapeHTML(title)}</h3>
          <button type="button" class="modal-close"
            data-action="close-modal">×</button>
        </div>
        <div class="modal-content">${content}</div>
      </div>
    </div>
  `;
}

function closeModal() {
  const root = document.getElementById("modalRoot");

  if (root) root.innerHTML = "";
}

/* =====================================================
   10. CATEGORY MANAGEMENT
===================================================== */

function renderCategories() {
  const categories = getCategories();

  document.getElementById("dynamicPage").innerHTML = `
    <div class="content-card">
      <div class="card-header">
        <h3>${t("categoryList")}</h3>
        <button class="primary-btn" data-action="add-category">
          + ${t("addNewCategory")}
        </button>
      </div>

      ${categories.length ? `
        <div class="category-grid">
          ${categories.map(category => `
            <div class="category-card">
              <div class="category-image">🍽️</div>
              <h3>${escapeHTML(category.name)}</h3>
              <p>${numberFormat(
                getFoods().filter(food =>
                  String(food.categoryId) === String(category.id)
                ).length
              )} ${t("foodMenu")}</p>
              <div class="category-actions">
                <button class="outline-btn"
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
      ` : `<div class="empty-state"><span>▤</span><p>${t("noCategories")}</p></div>`}
    </div>
  `;
}

function showCategoryForm(id = null) {
  const categories = getCategories();
  const category = categories.find(item =>
    String(item.id) === String(id)
  );

  editingCategoryId = id;

  openModal(
    id ? t("editCategory") : t("addNewCategory"),
    `
      <form id="categoryForm">
        <div class="form-group">
          <label>${t("categoryName")}</label>
          <input class="form-control" name="name"
            required maxlength="60"
            value="${escapeHTML(category?.name || "")}">
        </div>
        <div class="form-actions">
          <button class="primary-btn" type="submit">${t("save")}</button>
          <button class="outline-btn" type="button"
            data-action="close-modal">${t("cancel")}</button>
        </div>
      </form>
    `
  );
}

function saveCategory(form) {
  const name = form.elements.name.value.trim();

  if (!name) {
    toast(t("enterName"), "error");
    return;
  }

  const categories = getCategories();

  if (editingCategoryId) {
    const category = categories.find(item =>
      String(item.id) === String(editingCategoryId)
    );

    if (category) category.name = name;

    toast(t("categoryUpdated"));
  } else {
    categories.push({
      id: makeId(),
      name,
      createdAt: new Date().toISOString()
    });

    toast(t("categoryAdded"));
  }

  saveData(STORAGE.categories, categories);
  closeModal();
  renderPage();
}

function deleteCategory(id) {
  const foods = getFoods();

  const used = foods.some(food =>
    String(food.categoryId) === String(id)
  );

  if (used) {
    toast(t("cannotDeleteCategory"), "error");
    return;
  }

  if (!confirm(t("confirmDelete"))) return;

  saveData(
    STORAGE.categories,
    getCategories().filter(item =>
      String(item.id) !== String(id)
    )
  );

  toast(t("categoryDeleted"));
  renderPage();
}

/* =====================================================
   11. FOOD MANAGEMENT
===================================================== */

function renderFoods() {
  const foods = getFoods();

  document.getElementById("dynamicPage").innerHTML = `
    <div class="content-card">
      <div class="card-header">
        <h3>${t("foodList")}</h3>
        <button class="primary-btn" data-action="add-food">
          + ${t("addFood")}
        </button>
      </div>

      <div class="filter-bar">
        <input class="form-control"
          id="foodSearch"
          placeholder="${t("search")}"
          type="search">
      </div>

      <div id="foodGrid" class="food-grid">
        ${foods.length
          ? foods.map(food => foodCard(food)).join("")
          : `<div class="empty-state"><span>🍛</span><p>${t("noFoods")}</p></div>`
        }
      </div>
    </div>
  `;

  loadFoodImages();
}

function foodCard(food) {
  const category = getCategories().find(item =>
    String(item.id) === String(food.categoryId)
  );

  return `
    <article class="food-card" data-food-card="${escapeHTML(food.id)}">
      <div class="food-image-placeholder" id="food-image-${escapeHTML(food.id)}">
        🍛
      </div>
      <div class="food-card-body">
        <h3>${escapeHTML(food.name)}</h3>
        <p>${escapeHTML(category?.name || t("noCategory"))}</p>
        <div class="food-price">${money(food.price)}</div>
        <div class="food-card-actions">
          <button class="outline-btn"
            data-action="edit-food"
            data-id="${escapeHTML(food.id)}">${t("edit")}</button>
          <button class="danger-btn"
            data-action="delete-food"
            data-id="${escapeHTML(food.id)}">${t("delete")}</button>
        </div>
      </div>
    </article>
  `;
}

async function loadFoodImages() {
  for (const food of getFoods()) {
    if (!food.imageId) continue;

    const element = document.getElementById(
      `food-image-${food.id}`
    );

    if (!element) continue;

    const url = await imageURL(food.imageId);

    if (url && element.isConnected) {
      const img = document.createElement("img");

      img.src = url;
      img.alt = food.name;
      img.className = "food-image";

      element.replaceWith(img);
    }
  }
}

function showFoodForm(id = null) {
  const food = getFoods().find(item =>
    String(item.id) === String(id)
  );

  editingFoodId = id;

  const categories = getCategories();

  openModal(
    id ? t("editFood") : t("addNewFood"),
    `
      <form id="foodForm">
        <div class="form-group">
          <label>${t("foodName")}</label>
          <input class="form-control" name="name"
            required maxlength="100"
            value="${escapeHTML(food?.name || "")}">
        </div>

        <div class="form-group">
          <label>${t("foodPrice")}</label>
          <input class="form-control" name="price"
            type="number" min="0.01" step="0.01"
            required value="${food?.price ?? ""}">
        </div>

        <div class="form-group">
          <label>${t("category")}</label>
          <select class="form-control" name="categoryId" required>
            <option value="">${t("selectCategory")}</option>
            ${categories.map(category => `
              <option value="${escapeHTML(category.id)}"
                ${String(food?.categoryId) === String(category.id) ? "selected" : ""}>
                ${escapeHTML(category.name)}
              </option>
            `).join("")}
          </select>
        </div>

        <div class="form-group">
          <label>${t("chooseImage")}</label>
          <div class="image-upload">
            <input type="file" name="image"
              accept="image/*">
            <div id="foodImagePreview"></div>
          </div>
        </div>

        <div class="form-actions">
          <button class="primary-btn" type="submit">${t("save")}</button>
          <button class="outline-btn" type="button"
            data-action="close-modal">${t("cancel")}</button>
        </div>
      </form>
    `
  );

  if (food?.imageId) {
    imageURL(food.imageId).then(url => {
      const preview = document.getElementById("foodImagePreview");

      if (url && preview) {
        preview.innerHTML = `<img class="image-preview" src="${url}" alt="">`;
      }
    });
  }
}

async function saveFood(form) {
  const name = form.elements.name.value.trim();
  const price = Number(form.elements.price.value);
  const categoryId = form.elements.categoryId.value;
  const file = form.elements.image.files[0];

  if (!name) {
    toast(t("enterName"), "error");
    return;
  }

  if (!Number.isFinite(price) || price <= 0) {
    toast(t("enterPrice"), "error");
    return;
  }

  if (!categoryId || !getCategories().some(item =>
    String(item.id) === String(categoryId)
  )) {
    toast(t("selectCategory"), "error");
    return;
  }

  if (file && (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024)) {
    toast("ছবির ফাইলটি সঠিক নয় অথবা ৫ MB-এর বেশি।", "error");
    return;
  }

  const foods = getFoods();

  let existing = foods.find(item =>
    String(item.id) === String(editingFoodId)
  );

  let imageId = existing?.imageId || "";

  if (file) {
    imageId = await saveImage(file);
  }

  if (existing) {
    existing.name = name;
    existing.price = price;
    existing.categoryId = categoryId;
    existing.imageId = imageId;

    toast(t("foodUpdated"));
  } else {
    foods.push({
      id: makeId(),
      name,
      price,
      categoryId,
      imageId,
      createdAt: new Date().toISOString()
    });

    toast(t("foodAdded"));
  }

  saveData(STORAGE.foods, foods);
  closeModal();
  renderPage();
}

function deleteFood(id) {
  if (!confirm(t("confirmDelete"))) return;

  saveData(
    STORAGE.foods,
    getFoods().filter(food =>
      String(food.id) !== String(id)
    )
  );

  toast(t("foodDeleted"));
  renderPage();
}

/* =====================================================
   12. BILLING
===================================================== */

function renderBilling() {
  const foods = getFoods();
  const categories = getCategories();

  document.getElementById("dynamicPage").innerHTML = `
    <div class="billing-layout">

      <div class="billing-products">
        <div class="card-header">
          <h3>${t("selectFoods")}</h3>
        </div>

        <input class="form-control" id="billingSearch"
          placeholder="${t("search")}" type="search">

        <div class="billing-category-list">
          <button class="active" data-action="filter-category"
            data-id="all">${t("all")}</button>

          ${categories.map(category => `
            <button data-action="filter-category"
              data-id="${escapeHTML(category.id)}">
              ${escapeHTML(category.name)}
            </button>
          `).join("")}
        </div>

        <div class="billing-food-grid" id="billingFoodGrid">
          ${foods.length
            ? foods.map(food => `
              <button type="button"
                class="billing-food-item"
                data-action="add-to-cart"
                data-id="${escapeHTML(food.id)}">

                <div class="food-placeholder"
                  id="billing-image-${escapeHTML(food.id)}">🍛</div>

                <h4>${escapeHTML(food.name)}</h4>
                <p>${money(food.price)}</p>
              </button>
            `).join("")
            : `<div class="empty-state"><p>${t("addFoodFirst")}</p></div>`
          }
        </div>
      </div>

      <div class="billing-cart">
        <div class="card-header">
          <h3>${t("cart")}</h3>
          <button class="text-btn"
            data-action="clear-cart">${t("clearCart")}</button>
        </div>

        <div class="form-group">
          <label>${t("customer")}</label>
          <input class="form-control" id="customerName"
            placeholder="${t("customerName")}">
        </div>

        <div id="cartItems"></div>

        <div class="cart-summary">
          <div class="summary-row">
            <span>${t("subtotal")}</span>
            <strong id="cartSubtotal">${money(0)}</strong>
          </div>

          <div class="form-group">
            <label>${t("discountAmount")}</label>
            <input class="form-control" id="discountInput"
              type="number" min="0" step="0.01" value="0">
          </div>

          <div class="summary-row total">
            <span>${t("total")}</span>
            <strong id="cartTotal">${money(0)}</strong>
          </div>

          <button class="primary-btn" style="width:100%;margin-top:12px"
            data-action="save-bill">
            ${t("saveBill")}
          </button>

          <button class="outline-btn" style="width:100%;margin-top:8px"
            data-action="print-bill">
            ${t("printBill")}
          </button>
        </div>
      </div>

    </div>
  `;

  selectedCategory = "all";
  renderCart();
  loadBillingImages();
}

async function loadBillingImages() {
  for (const food of getFoods()) {
    if (!food.imageId) continue;

    const element = document.getElementById(
      `billing-image-${food.id}`
    );

    if (!element) continue;

    const url = await imageURL(food.imageId);

    if (url && element.isConnected) {
      const img = document.createElement("img");

      img.src = url;
      img.alt = food.name;

      element.replaceWith(img);
    }
  }
}

function addToCart(id) {
  const food = getFoods().find(item =>
    String(item.id) === String(id)
  );

  if (!food) return;

  const existing = cart.find(item =>
    String(item.id) === String(id)
  );

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      id: food.id,
      name: food.name,
      price: Number(food.price),
      quantity: 1,
      imageId: food.imageId || ""
    });
  }

  renderCart();
}

function changeQuantity(id, amount) {
  const item = cart.find(item =>
    String(item.id) === String(id)
  );

  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    cart = cart.filter(food =>
      String(food.id) !== String(id)
    );
  }

  renderCart();
}

function cartSubtotal() {
  return cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
}

function cartDiscount() {
  const input = document.getElementById("discountInput");
  const value = Math.max(0, Number(input?.value) || 0);

  return Math.min(value, cartSubtotal());
}

function cartTotal() {
  return Math.max(0, cartSubtotal() - cartDiscount());
}

function renderCart() {
  const container = document.getElementById("cartItems");

  if (!container) return;

  if (!cart.length) {
    container.innerHTML = `
      <div class="empty-state">
        <span>🧾</span>
        <p>${t("emptyCart")}</p>
      </div>
    `;
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${escapeHTML(item.name)}</h4>
          <p>${money(item.price)} × ${numberFormat(item.quantity)}</p>
        </div>

        <div class="quantity-control">
          <button data-action="decrease-item"
            data-id="${escapeHTML(item.id)}">−</button>

          <strong>${numberFormat(item.quantity)}</strong>

          <button data-action="increase-item"
            data-id="${escapeHTML(item.id)}">+</button>
        </div>

        <strong>${money(item.price * item.quantity)}</strong>
      </div>
    `).join("");
  }

  setText("cartSubtotal", money(cartSubtotal()));
  setText("cartTotal", money(cartTotal()));
}

function saveBill() {
  if (!cart.length) {
    toast(t("billEmpty"), "error");
    return;
  }

  if (!confirm(t("confirmBill"))) return;

  const bills = getBills();
  const now = new Date();

  const bill = {
    id: makeId(),
    number: "QB-" + now.getTime(),
    date: now.toISOString(),
    customer: document.getElementById("customerName")?.value.trim() || "",
    items: cart.map(item => ({ ...item })),
    subtotal: cartSubtotal(),
    discount: cartDiscount(),
    total: cartTotal(),
    settings: { ...getSettings() }
  };

  bills.push(bill);
  saveData(STORAGE.bills, bills);

  cart = [];

  toast(t("billSaved"));
  renderBilling();
  updateDashboard();
}

/* =====================================================
   13. CATEGORY FILTER + FOOD SEARCH
===================================================== */

function filterBillingFoods(categoryId) {
  selectedCategory = categoryId;

  document.querySelectorAll(
    ".billing-category-list button"
  ).forEach(button => {
    button.classList.toggle(
      "active",
      String(button.dataset.id) === String(categoryId)
    );
  });

  filterBillingList();
}

function filterBillingList() {
  const search = (
    document.getElementById("billingSearch")?.value || ""
  ).toLowerCase();

  document.querySelectorAll(".billing-food-item").forEach(button => {
    const food = getFoods().find(item =>
      String(item.id) === String(button.dataset.id)
    );

    if (!food) return;

    const categoryMatch =
      selectedCategory === "all" ||
      String(food.categoryId) === String(selectedCategory);

    const searchMatch =
      food.name.toLowerCase().includes(search);

    button.hidden = !(categoryMatch && searchMatch);
  });
}

function filterFoodManagement() {
  const search = (
    document.getElementById("foodSearch")?.value || ""
  ).toLowerCase();

  document.querySelectorAll("[data-food-card]").forEach(card => {
    const food = getFoods().find(item =>
      String(item.id) === String(card.dataset.foodCard)
    );

    card.hidden = !food ||
      !food.name.toLowerCase().includes(search);
  });
}

/* =====================================================
   14. BILL HISTORY
===================================================== */

function renderHistory(search = "") {
  const bills = [...getBills()]
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const filtered = bills.filter(bill =>
    String(bill.number).toLowerCase().includes(search.toLowerCase()) ||
    String(bill.customer || "").toLowerCase().includes(search.toLowerCase())
  );

  document.getElementById("dynamicPage").innerHTML = `
    <div class="content-card">
      <div class="card-header">
        <h3>${t("historyTitle")}</h3>
      </div>

      <div class="filter-bar">
        <input class="form-control" id="historySearch"
          placeholder="${t("searchBill")}"
          value="${escapeHTML(search)}">
      </div>

      ${filtered.length ? `
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>${t("billNumber")}</th>
                <th>${t("customer")}</th>
                <th>${t("date")}</th>
                <th>${t("total")}</th>
                <th>${t("actions")}</th>
              </tr>
            </thead>

            <tbody>
              ${filtered.map(bill => `
                <tr>
                  <td>${escapeHTML(bill.number)}</td>
                  <td>${escapeHTML(bill.customer || "-")}</td>
                  <td>${formatDate(bill.date)}</td>
                  <td>${money(bill.total)}</td>
                  <td>
                    <button class="outline-btn"
                      data-action="view-bill"
                      data-id="${escapeHTML(bill.id)}">
                      ${t("view")}
                    </button>
                    <button class="danger-btn"
                      data-action="delete-bill"
                      data-id="${escapeHTML(bill.id)}">
                      ${t("delete")}
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      ` : `<div class="empty-state"><p>${t("noHistory")}</p></div>`}
    </div>
  `;
}

function showBillDetails(id) {
  const bill = getBills().find(item =>
    String(item.id) === String(id)
  );

  if (!bill) return;

  openModal(t("billDetails"), `
    <div>
      <p><strong>${t("billNumber")}:</strong> ${escapeHTML(bill.number)}</p>
      <p><strong>${t("date")}:</strong> ${formatDate(bill.date)}</p>
      <p><strong>${t("customer")}:</strong> ${escapeHTML(bill.customer || "-")}</p>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>${t("item")}</th>
              <th>${t("quantity")}</th>
              <th>${t("amount")}</th>
            </tr>
          </thead>
          <tbody>
            ${(bill.items || []).map(item => `
              <tr>
                <td>${escapeHTML(item.name)}</td>
                <td>${numberFormat(item.quantity)}</td>
                <td>${money(item.price * item.quantity)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <div class="cart-summary">
        <div class="summary-row">
          <span>${t("subtotal")}</span>
          <strong>${money(bill.subtotal)}</strong>
        </div>
        <div class="summary-row">
          <span>${t("discount")}</span>
          <strong>${money(bill.discount)}</strong>
        </div>
        <div class="summary-row total">
          <span>${t("total")}</span>
          <strong>${money(bill.total)}</strong>
        </div>
      </div>

      <button class="primary-btn" data-action="print-history-bill"
        data-id="${escapeHTML(bill.id)}">
        ${t("printBill")}
      </button>
    </div>
  `);
}

function deleteBill(id) {
  if (!confirm(t("confirmDelete"))) return;

  saveData(
    STORAGE.bills,
    getBills().filter(bill =>
      String(bill.id) !== String(id)
    )
  );

  toast(t("billDeleted"));
  renderHistory();
  updateDashboard();
}

/* =====================================================
   15. SALES REPORT
===================================================== */

function renderReports() {
  const bills = getBills();
  const today = bills.filter(
    bill => billDateKey(bill.date) === todayKey()
  );

  const now = new Date();

  const month = bills.filter(bill => {
    const date = new Date(bill.date);

    return date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth();
  });

  const total = bills.reduce(
    (sum, bill) => sum + Number(bill.total || 0), 0
  );

  const monthTotal = month.reduce(
    (sum, bill) => sum + Number(bill.total || 0), 0
  );

  const todayTotal = today.reduce(
    (sum, bill) => sum + Number(bill.total || 0), 0
  );

  document.getElementById("dynamicPage").innerHTML = `
    <div class="content-card">
      <div class="card-header">
        <h3>${t("salesReport")}</h3>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon green">৳</div>
          <div>
            <p>${t("today")}</p>
            <h2>${money(todayTotal)}</h2>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon blue">📅</div>
          <div>
            <p>${t("thisMonth")}</p>
            <h2>${money(monthTotal)}</h2>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon orange">📊</div>
          <div>
            <p>${t("allTime")}</p>
            <h2>${money(total)}</h2>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon purple">🧾</div>
          <div>
            <p>${t("totalBills")}</p>
            <h2>${numberFormat(bills.length)}</h2>
          </div>
        </div>
      </div>

      <div class="content-card">
        <h3>${t("recentBills")}</h3>
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
              ${bills.length ? [...bills]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(bill => `
                  <tr>
                    <td>${formatDate(bill.date)}</td>
                    <td>${escapeHTML(bill.number)}</td>
                    <td>${money(bill.total)}</td>
                  </tr>
                `).join("")
                : `<tr><td colspan="3">${t("noHistory")}</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/* =====================================================
   16. RESTAURANT SETTINGS
===================================================== */

function renderSettings() {
  const settings = getSettings();

  document.getElementById("dynamicPage").innerHTML = `
    <div class="settings-layout">

      <div class="settings-card">
        <h3>${t("restaurantInfo")}</h3>

        <form id="settingsForm">
          <div class="form-group">
            <label>${t("restaurantName")}</label>
            <input class="form-control" name="name"
              value="${escapeHTML(settings.name || "")}"
              required>
          </div>

          <div class="form-group">
            <label>${t("address")}</label>
            <textarea class="form-control"
              name="address">${escapeHTML(settings.address || "")}</textarea>
          </div>

          <div class="form-group">
            <label>${t("phone")}</label>
            <input class="form-control" name="phone"
              value="${escapeHTML(settings.phone || "")}">
          </div>

          <div class="form-group">
            <label>${t("logo")}</label>
            <div class="image-upload">
              <input type="file" name="logo"
                accept="image/*">
              <div id="restaurantLogoPreview"></div>
            </div>
          </div>

          <button class="primary-btn" type="submit">
            ${t("save")}
          </button>
        </form>
      </div>

      <div class="settings-card">
        <h3>${t("language")}</h3>

        <div class="form-group">
          <label>${t("language")}</label>
          <select class="form-control" id="settingsLanguage">
            <option value="bn" ${currentLanguage === "bn" ? "selected" : ""}>বাংলা</option>
            <option value="en" ${currentLanguage === "en" ? "selected" : ""}>English</option>
          </select>
        </div>

        <hr>

        <h3 style="margin-top:20px">${t("backup")}</h3>

        <button class="primary-btn" data-action="backup">
          ${t("backup")}
        </button>

        <div style="height:12px"></div>

        <button class="outline-btn" data-action="restore">
          ${t("restore")}
        </button>

        <input type="file" id="restoreFile"
          accept=".json,application/json" hidden>
      </div>

    </div>
  `;

  if (settings.logoId) {
    imageURL(settings.logoId).then(url => {
      const preview = document.getElementById("restaurantLogoPreview");

      if (url && preview) {
        preview.innerHTML = `<img class="image-preview" src="${url}" alt="">`;
      }
    });
  }
}

async function saveSettings(form) {
  const settings = getSettings();

  settings.name = form.elements.name.value.trim();
  settings.address = form.elements.address.value.trim();
  settings.phone = form.elements.phone.value.trim();

  const file = form.elements.logo.files[0];

  if (file) {
    if (!file.type.startsWith("image/") ||
        file.size > 5 * 1024 * 1024) {
      toast("লোগোর ছবি সঠিক নয় অথবা ৫ MB-এর বেশি।", "error");
      return;
    }

    settings.logoId = await saveImage(file);
  }

  saveData(STORAGE.settings, settings);

  setText("sidebarRestaurantName", settings.name || "My Restaurant");
  setText("sidebarRestaurantAddress", settings.address || "");

  toast(t("settingsSaved"));
  renderSettings();
}

/* =====================================================
   17. INVOICE GENERATION
===================================================== */

async function buildInvoice(bill) {
  const settings = bill.settings || getSettings();

  const items = await Promise.all(
    (bill.items || []).map(async item => {
      const url = await imageURL(item.imageId);

      return { ...item, imageURL: url };
    })
  );

  const logoURL = await imageURL(settings.logoId);

  const invoice = document.createElement("div");

  invoice.className = "invoice-document";

  invoice.innerHTML = `
    <div class="invoice-header">
      ${logoURL ? `<img src="${logoURL}" alt="Logo" style="max-width:70px;max-height:70px;object-fit:contain">` : ""}
      <h1>${escapeHTML(settings.name || "QuickBill Restaurant")}</h1>
      <p>${escapeHTML(settings.address || "")}</p>
      <p>${escapeHTML(settings.phone || "")}</p>
      <h2>${currentLanguage === "bn" ? "বিল / রসিদ" : "INVOICE / RECEIPT"}</h2>
    </div>

    <div class="invoice-meta">
      <p><strong>${t("billNumber")}:</strong> ${escapeHTML(bill.number)}</p>
      <p><strong>${t("date")}:</strong> ${formatDate(bill.date)}</p>
      <p><strong>${t("customer")}:</strong> ${escapeHTML(bill.customer || "-")}</p>
    </div>

    <table class="invoice-table">
      <thead>
        <tr>
          <th>${t("item")}</th>
          <th>${t("quantity")}</th>
          <th>${t("unitPrice")}</th>
          <th>${t("amount")}</th>
        </tr>
      </thead>

      <tbody>
        ${items.map(item => `
          <tr>
            <td>
              ${item.imageURL
                ? `<img src="${item.imageURL}" alt="">`
                : ""
              }
              ${escapeHTML(item.name)}
            </td>
            <td>${numberFormat(item.quantity)}</td>
            <td>${money(item.price)}</td>
            <td>${money(item.price * item.quantity)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <div class="invoice-total">
      <p>${t("subtotal")}: <strong>${money(bill.subtotal)}</strong></p>
      <p>${t("discount")}: <strong>${money(bill.discount)}</strong></p>
      <h2>${t("total")}: ${money(bill.total)}</h2>
    </div>

    <div class="invoice-footer">
      <p>${t("printFooter")}</p>
    </div>
  `;

  return invoice;
}

async function printBillObject(bill) {
  const printArea = document.getElementById("printArea");

  if (!printArea || !bill) return;

  printArea.innerHTML = "";

  const invoice = await buildInvoice(bill);

  printArea.appendChild(invoice);

  const images = [...printArea.querySelectorAll("img")];

  await Promise.all(images.map(img => {
    if (img.complete) return Promise.resolve();

    return new Promise(resolve => {
      img.onload = resolve;
      img.onerror = resolve;
    });
  }));

  window.print();
}

function printCurrentBill() {
  if (!cart.length) {
    toast(t("billEmpty"), "error");
    return;
  }

  const now = new Date();

  const bill = {
    number: "PREVIEW",
    date: now.toISOString(),
    customer: document.getElementById("customerName")?.value || "",
    items: cart.map(item => ({ ...item })),
    subtotal: cartSubtotal(),
    discount: cartDiscount(),
    total: cartTotal(),
    settings: getSettings()
  };

  printBillObject(bill);
}

/* =====================================================
   18. BACKUP AND RESTORE
===================================================== */

async function createBackup() {
  const imageMap = {};

  const db = await openImageDB();

  const images = await new Promise((resolve, reject) => {
    const request = db.transaction(DB_STORE)
      .objectStore(DB_STORE).getAllKeys();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  for (const id of images) {
    const blob = await getBlobFromDB(id);

    if (blob) {
      imageMap[id] = await fileToDataURL(blob);
    }
  }

  const backup = {
    app: "QuickBill",
    version: 3,
    createdAt: new Date().toISOString(),
    data: {
      foods: getFoods(),
      categories: getCategories(),
      bills: getBills(),
      settings: getSettings(),
      language: currentLanguage
    },
    images: imageMap
  };

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `QuickBill-Backup-${todayKey()}.json`;
  link.click();

  URL.revokeObjectURL(url);

  toast(t("backupDone"));
}

async function getBlobFromDB(id) {
  const db = await openImageDB();

  return new Promise(resolve => {
    const request = db.transaction(DB_STORE)
      .objectStore(DB_STORE).get(id);

    request.onsuccess = () => {
      db.close();
      resolve(request.result || null);
    };

    request.onerror = () => {
      db.close();
      resolve(null);
    };
  });
}

async function restoreBackup(file) {
  try {
    const backup = JSON.parse(await file.text());

    if (
      backup.app !== "QuickBill" ||
      !backup.data ||
      !Array.isArray(backup.data.foods) ||
      !Array.isArray(backup.data.categories) ||
      !Array.isArray(backup.data.bills)
    ) {
      throw new Error("Invalid backup");
    }

    if (!confirm(t("confirmBill"))) return;

    saveData(STORAGE.foods, backup.data.foods);
    saveData(STORAGE.categories, backup.data.categories);
    saveData(STORAGE.bills, backup.data.bills);
    saveData(STORAGE.settings, backup.data.settings || {});

    if (backup.data.language === "bn" ||
        backup.data.language === "en") {
      currentLanguage = backup.data.language;
      localStorage.setItem(STORAGE.language, currentLanguage);
    }

    if (backup.images && typeof backup.images === "object") {
      for (const [id, dataURL] of Object.entries(backup.images)) {
        const blob = dataURLToBlob(dataURL);
        const db = await openImageDB();

        await new Promise((resolve, reject) => {
          const transaction = db.transaction(DB_STORE, "readwrite");

          transaction.objectStore(DB_STORE).put(blob, id);

          transaction.oncomplete = resolve;
          transaction.onerror = () => reject(transaction.error);
        });

        db.close();
      }
    }

    applyLanguage();
    updateRestaurantSidebar();

    toast(t("restoreDone"));
  } catch (error) {
    console.error(error);
    toast(t("invalidBackup"), "error");
  }
}

/* =====================================================
   19. RESTAURANT SIDEBAR UPDATE
===================================================== */

function updateRestaurantSidebar() {
  const settings = getSettings();

  setText(
    "sidebarRestaurantName",
    settings.name || "My Restaurant"
  );

  setText(
    "sidebarRestaurantAddress",
    settings.address || "Restaurant Address"
  );

  const logo = document.getElementById("sidebarRestaurantLogo");

  if (!logo) return;

  if (settings.logoId) {
    imageURL(settings.logoId).then(url => {
      if (url && logo.isConnected) {
        logo.innerHTML = "";

        const img = document.createElement("img");
        img.src = url;
        img.alt = "Restaurant logo";

        logo.appendChild(img);
      }
    });
  }
}

/* =====================================================
   20. EVENT DELEGATION
===================================================== */

document.addEventListener("click", event => {
  const pageButton = event.target.closest("[data-page]");

  if (pageButton) {
    navigate(pageButton.dataset.page);
    return;
  }

  const actionButton = event.target.closest("[data-action]");

  if (!actionButton) return;

  const action = actionButton.dataset.action;
  const id = actionButton.dataset.id;

  switch (action) {
    case "add-category":
      showCategoryForm();
      break;

    case "edit-category":
      showCategoryForm(id);
      break;

    case "delete-category":
      deleteCategory(id);
      break;

    case "add-food":
      if (!getCategories().length) {
        toast(t("noCategories"), "error");
        navigate("categories");
        return;
      }
      showFoodForm();
      break;

    case "edit-food":
      showFoodForm(id);
      break;

    case "delete-food":
      deleteFood(id);
      break;

    case "close-modal":
      if (
        event.target === actionButton ||
        actionButton.classList.contains("modal-close")
      ) {
        closeModal();
      }
      break;

    case "filter-category":
      filterBillingFoods(id);
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
      cart = cart.filter(item => String(item.id) !== String(id));
      renderCart();
      break;

    case "clear-cart":
      if (cart.length && confirm(t("confirmDelete"))) {
        cart = [];
        renderCart();
      }
      break;

    case "save-bill":
      saveBill();
      break;

    case "print-bill":
      printCurrentBill();
      break;

    case "backup":
      createBackup().catch(error => {
        console.error(error);
        toast("Backup failed", "error");
      });
      break;

    case "restore":
      document.getElementById("restoreFile")?.click();
      break;

    case "view-bill":
      showBillDetails(id);
      break;

    case "delete-bill":
      deleteBill(id);
      break;

    case "print-history-bill": {
      const bill = getBills().find(item =>
        String(item.id) === String(id)
      );

      closeModal();

      if (bill) printBillObject(bill);
      break;
    }
  }
});

/* =====================================================
   21. FORM SUBMISSIONS
===================================================== */

document.addEventListener("submit", event => {
  event.preventDefault();

  const form = event.target;

  if (form.id === "categoryForm") {
    saveCategory(form);
  }

  if (form.id === "foodForm") {
    saveFood(form).catch(error => {
      console.error(error);
      toast("Could not save food", "error");
    });
  }

  if (form.id === "settingsForm") {
    saveSettings(form).catch(error => {
      console.error(error);
      toast("Could not save settings", "error");
    });
  }
});

/* =====================================================
   22. INPUT EVENTS
===================================================== */

document.addEventListener("input", event => {
  if (event.target.id === "foodSearch") {
    filterFoodManagement();
  }

  if (event.target.id === "billingSearch") {
    filterBillingList();
  }

  if (event.target.id === "discountInput") {
    renderCart();
  }

  if (event.target.id === "historySearch") {
    renderHistory(event.target.value);
  }
});

/* =====================================================
   23. CHANGE EVENTS
===================================================== */

document.addEventListener("change", event => {
  if (event.target.id === "languageSelect" ||
      event.target.id === "settingsLanguage") {

    const value = event.target.value;

    if (value !== "bn" && value !== "en") return;

    currentLanguage = value;

    localStorage.setItem(STORAGE.language, value);

    applyLanguage();
  }

  if (event.target.id === "restoreFile") {
    const file = event.target.files?.[0];

    if (file) {
      restoreBackup(file).catch(error => {
        console.error(error);
        toast(t("invalidBackup"), "error");
      });
    }

    event.target.value = "";
  }
});

/* =====================================================
   24. MENU AND OVERLAY EVENTS
===================================================== */

document.getElementById("menuToggle")?.addEventListener(
  "click",
  toggleSidebar
);

document.getElementById("sidebarOverlay")?.addEventListener(
  "click",
  closeSidebar
);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeSidebar();
    closeModal();
  }
});

/* =====================================================
   25. INITIALIZATION
===================================================== */

function initializeQuickBill() {
  const year = document.getElementById("currentYear");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  if (!["bn", "en"].includes(currentLanguage)) {
    currentLanguage = "bn";
  }

  const languageSelect = document.getElementById("languageSelect");

  if (languageSelect) {
    languageSelect.value = currentLanguage;
  }

  applyLanguage();
  updateRestaurantSidebar();
  updateDashboard();

  closeSidebar();

  console.log("QuickBill initialized successfully.");
}

document.addEventListener(
  "DOMContentLoaded",
  initializeQuickBill
);
