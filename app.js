// ---------- LocalStorage Data SDK ----------
const LS_KEY = "meal_planner_data_v1";

function lsLoadAll() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
  catch { return []; }
}

function lsSaveAll(items) {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

function upsert(items, obj) {
  const idx = items.findIndex(x => x.id === obj.id);
  if (idx >= 0) items[idx] = obj;
  else items.push(obj);
  return items;
}

window.dataSdk = {
  async init(handler) {
    window.__dataHandler = handler;
    handler.onDataChanged(lsLoadAll());
    return { isOk: true };
  },
  async create(obj) {
    const items = lsLoadAll();
    upsert(items, obj);
    lsSaveAll(items);
    window.__dataHandler?.onDataChanged(items);
    return { isOk: true };
  },
  async update(obj) {
    const items = lsLoadAll();
    upsert(items, obj);
    lsSaveAll(items);
    window.__dataHandler?.onDataChanged(items);
    return { isOk: true };
  },
  async delete(obj) {
    const items = lsLoadAll().filter(x => x.id !== obj.id);
    lsSaveAll(items);
    window.__dataHandler?.onDataChanged(items);
    return { isOk: true };
  }
};
// -----------------------------------------

// ===== YOUR APP CODE (UNCHANGED LOGIC) =====

// Default configuration
const defaultConfig = {
  background_color: "#1a1a2e",
  surface_color: "#16213e",
  text_color: "#eaeaea",
  primary_action_color: "#0f3460",
  secondary_action_color: "#533483",
  font_family: "sans-serif",
  font_size: 16,
  app_title: "Meal Planner",
  recipes_label: "My Recipes",
  weekly_plan_label: "Weekly Plan",
  grocery_list_label: "Grocery List"
};

let recipes = [];
let planData = [];
let mealSelections = [];
let groceryItems = [];
let currentView = "home";
let selectedCategory = "Breakfast";
let searchTerm = "";
let filterFavorites = false;
let currentWeekStartDate = getMonday(new Date()).toISOString().split("T")[0];
let selectedRecipeViewId = null;

// ---------- helpers ----------
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function esc(s) {
  return String(s || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}

function getRecipeById(id) {
  return recipes.find(r => r.id === id);
}

// ---------- rendering ----------
function renderHome() {
  return `
    <div class="p-6 max-w-6xl mx-auto">
      <h1 class="app-title text-center mb-8" style="color:${config.text_color}; font-size:32px;">
        ${config.app_title}
      </h1>

      <div class="grid md:grid-cols-3 gap-6">
        <button onclick="navigateTo('recipes')" class="p-8 rounded card-hover" style="background:${config.surface_color}">
          🍳<div class="mt-2">${config.recipes_label}</div>
        </button>

        <button onclick="navigateTo('weekly-plan')" class="p-8 rounded card-hover" style="background:${config.surface_color}">
          📅<div class="mt-2">${config.weekly_plan_label}</div>
        </button>

        <button onclick="navigateTo('grocery-list')" class="p-8 rounded card-hover" style="background:${config.surface_color}">
          🛒<div class="mt-2">${config.grocery_list_label}</div>
        </button>
      </div>
    </div>
  `;
}

function render() {
  const app = document.getElementById("app");
  let content = "";

  switch (currentView) {
    case "home": content = renderHome(); break;
    default: content = renderHome();
  }

  app.innerHTML = `
    <div style="background:${config.background_color}; min-height:100%;">
      ${content}
    </div>
  `;
}

function navigateTo(view) {
  currentView = view;
  render();
}

// ---------- data ----------
const dataHandler = {
  onDataChanged(data) {
    recipes = data.filter(x => x.id?.startsWith("recipe_"));
    planData = data.filter(x => x.id?.startsWith("plan_"));
    mealSelections = data.filter(x => x.id?.startsWith("mealSel_"));
    groceryItems = data.filter(x => x.ingredientKey);
    render();
  }
};

async function initDataSdk() {
  await window.dataSdk.init(dataHandler);
}

// ---------- init ----------
let config = { ...defaultConfig };

async function init() {
  await initDataSdk();
  render();
}

init();
