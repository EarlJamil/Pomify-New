const SECTIONS = ["do", "decide", "delegate", "delete", "done"];
let taskCounter = 0;

// ==== Pomify Mechanics ====
const DAILY_LIMIT = 5;
let dailyTasksDone = JSON.parse(localStorage.getItem("eisenhower_dailyTasksDone")) || 0;
let extraUsed = JSON.parse(localStorage.getItem("eisenhower_extraUsed")) || false;
let lastDate = localStorage.getItem("eisenhower_lastDate") || new Date().toDateString();

// Reset daily progress if it's a new day
if (lastDate !== new Date().toDateString()) {
  dailyTasksDone = 0;
  extraUsed = false;
  localStorage.setItem("eisenhower_dailyTasksDone", 0);
  localStorage.setItem("eisenhower_extraUsed", false);
  localStorage.setItem("eisenhower_lastDate", new Date().toDateString());
}

// Update coin display
function updateCoinsDisplay() {
  const coins = parseInt(localStorage.getItem("pomify_coins") || "0");
  document.getElementById("coins").textContent = coins;
}

// Add a coin (for testing or rewards)
document.getElementById("addCoinBtn")?.addEventListener("click", () => {
  let coins = parseInt(localStorage.getItem("pomify_coins") || "0");
  coins++;
  localStorage.setItem("pomify_coins", coins);
  updateCoinsDisplay();
});

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
  // Check if daily limit reached
  if (dailyTasksDone >= DAILY_LIMIT) {
    if (!extraUsed) {
      const useExtra = confirm(
        "You’ve reached your daily limit of 5 completed tasks.\nUse 1 coin for an extra session?"
      );
      if (useExtra) {
        let coins = parseInt(localStorage.getItem("pomify_coins") || "0");
        if (coins > 0) {
          coins--;
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

  // Proceed marking task as done
  task.querySelectorAll("button").forEach((btn) => btn.remove());
  task.classList.add("done");
  task.querySelector("span").style.textDecoration = "line-through";
  task.draggable = false;
  task.removeEventListener("dragstart", drag);
  document.getElementById("done").appendChild(task);

  dailyTasksDone++;
  localStorage.setItem("eisenhower_dailyTasksDone", dailyTasksDone);
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
