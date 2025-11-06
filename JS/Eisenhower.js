const SECTIONS = ["do", "decide", "delegate", "delete", "done"];
let taskCounter = 0;

// ==== Pomify Mechanics ====
const DAILY_LIMIT = 5;
let dailyTasksDone = JSON.parse(localStorage.getItem("eisenhower_dailyTasksDone")) || 0;
let extraUsed = JSON.parse(localStorage.getItem("eisenhower_extraUsed")) || false;
let lastDate = localStorage.getItem("eisenhower_lastDate") || new Date().toDateString();

// ==== Premium Detection ====
const userPlan = (localStorage.getItem("pomify_plan") || "Basic").toLowerCase();
const isPremiumUser = userPlan.includes("premium");

// Reset daily progress if it's a new day
if (lastDate !== new Date().toDateString()) {
  dailyTasksDone = 0;
  extraUsed = false;
  localStorage.setItem("eisenhower_dailyTasksDone", 0);
  localStorage.setItem("eisenhower_extraUsed", false);
  localStorage.setItem("eisenhower_lastDate", new Date().toDateString());
}

// === UI Enhancements (Badges & Buttons) ===
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".container.my-4");
  const addCoinBtn = document.getElementById("addCoinBtn");

  // --- Show Premium Badge ---
  if (isPremiumUser && container) {
  const badge = document.createElement("div");
  badge.textContent = userPlan.includes("premium+")
    ? "💎 Premium+ Access: Lifetime Productivity Tools"
    : "🌟 Premium Access: Full Productivity Tools";

  // Pomify red full-width scheme
  badge.style.background = "linear-gradient(180deg, #b44a4a 0%, #4a001f 100%)";
  badge.style.color = "white";
  badge.style.padding = "12px 20px";
  badge.style.borderRadius = "10px";
  badge.style.margin = "0 auto 20px auto";
  badge.style.fontWeight = "700";
  badge.style.textAlign = "center";
  badge.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  badge.style.border = "1px solid rgba(255,255,255,0.18)";
  badge.style.width = "100%";          // full width
  badge.style.display = "block";       // ensure it stretches fully
  badge.style.letterSpacing = "0.5px";

  container.prepend(badge);
}



  // --- Hide Add Coin Button for Premium Users ---
  if (isPremiumUser && addCoinBtn) {
    addCoinBtn.style.display = "none";
  }

  // --- Make the + button redirect to shop ---
  if (addCoinBtn) {
    addCoinBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "Shop.html"; // redirect only
    });
  }

  updateCoinsDisplay();
});

// === Coin Display ===
function updateCoinsDisplay() {
  const coins = parseInt(localStorage.getItem("pomify_coins") || "0");
  const coinsEl = document.getElementById("coins");
  if (coinsEl) coinsEl.textContent = coins;
}

// === Eisenhower Task Functions ===
function addTask() {
  const input = document.getElementById("taskInput");
  const text = input.value.trim();
  if (!text) return;
  const task = createTaskElement(text, false);
  document.getElementById("do").appendChild(task);
  input.value = "";
  saveAllTasks();
}

function createTaskElement(text, completed = false) {
  const task = document.createElement("div");
  task.className =
    "task-item" +
    (completed ? " done " : " ") +
    "d-flex justify-content-between align-items-center border rounded px-2 py-1 my-1 bg-white";
  task.id = "task-" + (Date.now() + "-" + taskCounter++);
  task.draggable = !completed;

  const span = document.createElement("span");
  span.textContent = text;
  span.className = "text-start flex-grow-1";

  const btnGroup = document.createElement("div");
  btnGroup.className = "d-flex gap-1";

  if (!completed) {
    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-sm btn-outline-primary";
    editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
    editBtn.title = "Edit";
    editBtn.onclick = () => editTask(span);

    const doneBtn = document.createElement("button");
    doneBtn.className = "btn btn-sm btn-outline-success";
    doneBtn.innerHTML = '<i class="bi bi-check2-circle"></i>';
    doneBtn.title = "Mark done";
    doneBtn.onclick = () => markDone(task);

    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-sm btn-outline-danger";
    delBtn.innerHTML = '<i class="bi bi-trash"></i>';
    delBtn.title = "Delete";
    delBtn.onclick = () => {
      task.remove();
      saveAllTasks();
    };

    btnGroup.append(editBtn, doneBtn, delBtn);
  }

  task.append(span, btnGroup);

  if (!completed) {
    task.addEventListener("dragstart", drag);
  }

  return task;
}

function editTask(span) {
  const current = span.textContent;
  const input = document.createElement("input");
  input.type = "text";
  input.value = current;
  input.className = "form-control form-control-sm";
  span.replaceWith(input);
  input.focus();

  input.addEventListener("blur", () => finishEdit(input, current));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") finishEdit(input, current);
  });
}

function finishEdit(input, oldText) {
  const newText = input.value.trim() || oldText;
  const span = document.createElement("span");
  span.textContent = newText;
  input.replaceWith(span);
  saveAllTasks();
}

function markDone(task) {
  // === PREMIUM USERS: UNLIMITED TASKS ===
  if (isPremiumUser) {
    completeTaskNormally(task);
    alert("✅ Task completed! (Unlimited for Premium users)");
    return;
  }

  // === FREE USERS: Apply Limits ===
  if (dailyTasksDone >= DAILY_LIMIT) {
    if (!extraUsed) {
      const useExtra = confirm(
        "You’ve reached your daily limit of 5 completed tasks.\nUse 5 coin for an extra session?"
      );
      if (useExtra) {
        let coins = parseInt(localStorage.getItem("pomify_coins") || "0");
        if (coins > 5) {
          coins= coins-5;
          localStorage.setItem("pomify_coins", coins);
          extraUsed = true;
          localStorage.setItem("eisenhower_extraUsed", true);
          alert("Extra session activated! You can complete 1 more task today.");
          updateCoinsDisplay();
        } else {
          alert("You don't have enough coins!");
          return;
        }
      } else {
        alert("Come back tomorrow to complete more tasks!");
        return;
      }
    } else {
      alert("You already used your extra session for today.");
      return;
    }
  }

  completeTaskNormally(task);
  dailyTasksDone++;
  localStorage.setItem("eisenhower_dailyTasksDone", dailyTasksDone);
}

function completeTaskNormally(task) {
  task.querySelectorAll("button").forEach((btn) => btn.remove());
  task.classList.add("done");
  task.querySelector("span").style.textDecoration = "line-through";
  task.draggable = false;
  task.removeEventListener("dragstart", drag);
  document.getElementById("done").appendChild(task);
  saveAllTasks();
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  const id = ev.target.closest(".task-item").id;
  ev.dataTransfer.setData("text/plain", id);
}

function drop(ev) {
  ev.preventDefault();
  const id = ev.dataTransfer.getData("text/plain");
  const task = document.getElementById(id);
  if (!task) return;
  const target = ev.currentTarget;

  if (target.id === "done") {
    markDone(task);
  } else {
    target.appendChild(task);
  }

  saveAllTasks();
}

function clearCompleted() {
  const doneContainer = document.getElementById("done");
  doneContainer.innerHTML = "";
  saveAllTasks();
}

function saveAllTasks() {
  const allTasks = {};
  SECTIONS.forEach((section) => {
    const container = document.getElementById(section);
    allTasks[section] = Array.from(container.children).map((task) => ({
      text: task.querySelector("span").textContent,
      done: task.classList.contains("done"),
    }));
  });

  localStorage.setItem("eisenhower_tasks", JSON.stringify(allTasks));
  localStorage.setItem("pomify_do_tasks", JSON.stringify(allTasks["do"].map((t) => t.text)));
}

function loadAllTasks() {
  const data = JSON.parse(localStorage.getItem("eisenhower_tasks")) || {};
  SECTIONS.forEach((section) => {
    const container = document.getElementById(section);
    container.innerHTML = "";
    (data[section] || []).forEach((taskData) => {
      const el = createTaskElement(taskData.text, taskData.done);
      container.appendChild(el);
    });
  });
}

window.addEventListener("storage", (e) => {
  if (e.key === "pomify_do_tasks") {
    const doTasks = JSON.parse(localStorage.getItem("pomify_do_tasks")) || [];
    const all = JSON.parse(localStorage.getItem("eisenhower_tasks")) || {};
    all["do"] = doTasks.map((t) => ({ text: t, done: false }));
    localStorage.setItem("eisenhower_tasks", JSON.stringify(all));
    loadAllTasks();
  }
});

window.onload = () => {
  loadAllTasks();
  updateCoinsDisplay();
};

document.addEventListener("DOMContentLoaded", () => {
          const searchInput = document.getElementById("searchInput");
          const suggestionsBox = document.getElementById("suggestions");

          const pages = [
            { name: "Dashboard", url: "Dashboard.html" },
            { name: "Calendar / Task Management", url: "TaskManagement.html" },
            { name: "Pomodoro Technique", url: "Pomodoro.html" },
            { name: "Eisenhower Matrix", url: "Eisenhower.html" },
            { name: "Mind Mapping", url: "Mind-Mapping.html" },
            { name: "Study Notes", url: "Notes.html" },
            { name: "Shop / Pomi Coins", url: "Shop.html" },
            { name: "Shop / Premium", url: "Shop.html" },
            { name: "Socials", url: "Socials.html" },
            { name: "Settings", url: "Settings.html" }
          ];

          // Show suggestions as user types
          searchInput.addEventListener("input", () => {
            const query = searchInput.value.toLowerCase().trim();
            suggestionsBox.innerHTML = "";

            if (!query) {
              suggestionsBox.style.display = "none";
              return;
            }

            const matched = pages.filter(p => p.name.toLowerCase().includes(query));

            if (matched.length === 0) {
              suggestionsBox.style.display = "none";
              return;
            }

            matched.forEach(p => {
              const li = document.createElement("li");
              li.classList.add("list-group-item");
              li.textContent = p.name;
              li.addEventListener("click", () => {
                window.location.href = p.url;
              });
              suggestionsBox.appendChild(li);
            });

            suggestionsBox.style.display = "block";
          });

          // Hide suggestions when clicking outside
          document.addEventListener("click", (e) => {
            if (!e.target.closest(".search-container")) {
              suggestionsBox.style.display = "none";
            }
          });
        });
