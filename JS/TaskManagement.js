 const calendar = document.getElementById('calendar');
  const monthYear = document.getElementById('monthYear');
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');
  const taskList = document.getElementById('taskList');
  const selectedDateLabel = document.getElementById('selectedDateLabel');
  const taskText = document.getElementById('taskText');
  const importanceSelect = document.getElementById('importance');
  const addTaskBtn = document.getElementById('addTaskBtn');
  const editModal = new bootstrap.Modal(document.getElementById('editModal'));
  const editTaskText = document.getElementById('editTaskText');
  const editImportance = document.getElementById('editImportance');
  const saveEditBtn = document.getElementById('saveEditBtn');

  let selectedDate = new Date();
  let currentMonth = selectedDate.getMonth();
  let currentYear = selectedDate.getFullYear();
  let editTarget = { dateKey: null, index: null };

  document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    renderCalendar(currentMonth, currentYear);
    updateTaskList(selectedDate);
  }, 0); // You can increase to 50–100ms if needed
});

  prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
  });

  nextMonthBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
  });

  function renderCalendar(month, year) {
    calendar.innerHTML = '';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
      const header = document.createElement('div');
      header.className = 'calendar-header';
      header.textContent = day;
      calendar.appendChild(header);
    });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    monthYear.textContent = `${firstDay.toLocaleString('default', { month: 'long' })} ${year}`;

    // empty slots before the first day
    for (let i = 0; i < startDay; i++) {
      const empty = document.createElement('div');
      calendar.appendChild(empty);
    }

    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement('div');
      const cellDate = new Date(year, month, day);
      const dateKey = cellDate.toISOString().split('T')[0];
      const isPast = cellDate < todayMidnight;

      cell.className = 'calendar-cell';
      if (isPast) cell.classList.add('past-date');
      if (cellDate.toDateString() === today.toDateString()) cell.classList.add('today');
      if (cellDate.toDateString() === selectedDate.toDateString()) cell.classList.add('selected');

      const dayLabel = document.createElement('div');
      dayLabel.className = 'fw-bold small';
      dayLabel.textContent = day;
      cell.appendChild(dayLabel);

      const tasks = getTasks()[dateKey] || [];
      tasks.slice(0, 2).forEach(task => {
        const preview = document.createElement('div');
        preview.className = `task-preview ${task.importance.toLowerCase()}`;
        preview.textContent = task.text;
        cell.appendChild(preview);
      });

      if (tasks.length > 2) {
        const more = document.createElement('div');
        more.className = 'task-preview bg-secondary text-dark';
        more.textContent = `+${tasks.length - 2} more`;
        cell.appendChild(more);
      }

      cell.addEventListener('click', () => {
        selectedDate = cellDate;
        renderCalendar(currentMonth, currentYear);
        updateTaskList(selectedDate);
      });

      calendar.appendChild(cell);
    }

    // fill remaining cells for 6 rows (consistent height)
    const totalCells = calendar.children.length;
    const extraCells = 7 * 6 - totalCells;
    for (let i = 0; i < extraCells; i++) {
      const filler = document.createElement('div');
      calendar.appendChild(filler);
    }
  }

  function updateTaskList(date) {
    const dateKey = date.toISOString().split('T')[0];
    const formatted = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    selectedDateLabel.textContent = formatted;

    const tasks = getTasks()[dateKey] || [];
    taskList.innerHTML = '';

    if (tasks.length === 0) {
      taskList.innerHTML = '<li class="text-muted small">No tasks for this date.</li>';
      return;
    }

    tasks.forEach((task, index) => {
      const li = document.createElement('li');
      li.className = 'd-flex justify-content-between align-items-center border-bottom py-2';
      li.innerHTML = `
        <span><strong>${task.text}</strong>
          <span class="badge text-dark ${task.importance.toLowerCase()} ms-2">${task.importance}</span>
        </span>
        <div>
          <button class="btn btn-sm btn-outline-dark me-1" onclick="openEdit('${dateKey}', ${index})"><i class="bi bi-pencil-square"></i></button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteTask('${dateKey}', ${index})"><i class="bi bi-trash"></i></button>
        </div>
      `;
      taskList.appendChild(li);
    });
  }

  addTaskBtn.addEventListener('click', () => {
    const text = taskText.value.trim();
    const importance = importanceSelect.value;
    if (!text || !importance) return alert('Please enter task and importance.');

    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (selectedDate < todayMidnight)
      return alert('You cannot add tasks to past dates.');

    const dateKey = selectedDate.toISOString().split('T')[0];
    const tasks = getTasks();
    tasks[dateKey] = tasks[dateKey] || [];
    tasks[dateKey].push({ text, importance });
    localStorage.setItem('calendarTasks', JSON.stringify(tasks));

    taskText.value = '';
    importanceSelect.value = '';
    updateTaskList(selectedDate);
    renderCalendar(currentMonth, currentYear);
  });

  function openEdit(dateKey, index) {
    const tasks = getTasks();
    const task = tasks[dateKey][index];
    editTaskText.value = task.text;
    editImportance.value = task.importance;
    editTarget = { dateKey, index };
    editModal.show();
  }

  saveEditBtn.addEventListener('click', () => {
    const { dateKey, index } = editTarget;
    const tasks = getTasks();
    tasks[dateKey][index] = {
      text: editTaskText.value.trim(),
      importance: editImportance.value
    };
    localStorage.setItem('calendarTasks', JSON.stringify(tasks));
    editModal.hide();
    updateTaskList(selectedDate);
    renderCalendar(currentMonth, currentYear);
  });

  function deleteTask(dateKey, index) {
    const tasks = getTasks();
    tasks[dateKey].splice(index, 1);
    localStorage.setItem('calendarTasks', JSON.stringify(tasks));
    updateTaskList(selectedDate);
    renderCalendar(currentMonth, currentYear);
  }

  function getTasks() {
    return JSON.parse(localStorage.getItem('calendarTasks')) || {};
  }

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
