// ==========================================
// 1. AUTHENTICATION & GLOBAL VARIABLES
// ==========================================
const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

const user = JSON.parse(localStorage.getItem("user"));
const params = new URLSearchParams(window.location.search);
const projectId = params.get("id");
let currentTaskId = null;

// Reusable fetch headers for compacting
const authHeaders = { Authorization: `Bearer ${token}` };
const jsonHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

// ==========================================
// 2. DOM ELEMENTS
// ==========================================
const taskModal = document.getElementById("taskModal");
const memberModal = document.getElementById("memberModal");
const taskDetailsModal = document.getElementById("taskDetailsModal"); // Fixed: Was duplicated as 'taskModal'

// ==========================================
// 3. EVENT LISTENERS
// ==========================================
document.getElementById("backBtn").onclick = () => window.location.href = "dashboard.html";
document.getElementById("createTaskBtn").onclick = () => taskModal.style.display = "flex";
document.getElementById("inviteMemberBtn").onclick = () => memberModal.style.display = "flex";
document.getElementById("updateTaskBtn").addEventListener("click", updateTask);
document.getElementById("deleteTaskBtn").addEventListener("click", deleteTask);

window.addEventListener("click", (event) => {
  if (event.target === taskDetailsModal) closeTaskModal();
});

// ==========================================
// 4. INITIALIZATION
// ==========================================
loadProject();
loadMembers();
loadTasks();

// ==========================================
// 5. PROJECT FUNCTIONS
// ==========================================
async function loadProject() {
  try {
    const response = await fetch(`http://localhost:8000/api/projects/${projectId}`, { headers: authHeaders });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    document.getElementById("projectName").innerText = data.project.name;
    document.getElementById("projectDescription").innerText = data.project.description || "No description available";
  } catch (error) {
    console.error(error);
  }
}

// ==========================================
// 6. MEMBER FUNCTIONS
// ==========================================
async function loadMembers() {
  try {
    const response = await fetch(`http://localhost:8000/api/projects/${projectId}/members`, { headers: authHeaders });
    const data = await response.json();
    const container = document.getElementById("membersContainer");
    
    container.innerHTML = "";
    data.members.forEach((member) => {
      container.innerHTML += `
      <div class="member-card">
          <div>
              <h4>${member.username}</h4>
              <p>${member.email}</p>
          </div>
          <div class="member-actions">
              <select onchange="changeMemberRole(${member.user_id}, this.value)">
                  <option value="member" ${member.role === "member" ? "selected" : ""}>Member</option>
                  <option value="admin" ${member.role === "admin" ? "selected" : ""}>Admin</option>
                  <option value="owner" ${member.role === "owner" ? "selected" : ""}>Owner</option>
              </select>
              <button onclick="removeMember(${member.user_id})">Remove</button>
          </div>
      </div>`;
    });
  } catch (error) {
    console.error(error);
  }
}

async function loadAssignMembers(selectedId) {
  const response = await fetch(`http://localhost:8000/api/projects/${projectId}/members`, { headers: authHeaders });
  const data = await response.json();
  const select = document.getElementById("assignMember");
  
  select.innerHTML = "";
  data.members.forEach((member) => {
    select.innerHTML += `<option value="${member.user_id}">${member.username} (${member.role})</option>`;
  });
  if (selectedId) select.value = selectedId;
}

async function inviteMember() {
  const email = document.getElementById("memberEmail").value;
  const role = document.getElementById("memberRole").value;

  const response = await fetch(`http://localhost:8000/api/projects/${projectId}/members`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email, role }),
  });
  const data = await response.json();
  
  alert(data.message);
  memberModal.style.display = "none";
  loadMembers();
}

async function changeMemberRole(userId, role) {
  const response = await fetch(`http://localhost:8000/api/projects/${projectId}/members/${userId}`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify({ role }),
  });
  const data = await response.json();
  
  alert(data.message);
  loadMembers();
}

async function removeMember(userId) {
  if (!confirm("Remove this member?")) return;

  const response = await fetch(`http://localhost:8000/api/projects/${projectId}/members/${userId}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  const data = await response.json();
  
  alert(data.message);
  loadMembers();
}

// ==========================================
// 7. TASK FUNCTIONS
// ==========================================
async function loadTasks() {
  try {
    const response = await fetch(`http://localhost:8000/api/tasks/project/${projectId}`, { headers: authHeaders });
    const data = await response.json();

    document.getElementById("todo").innerHTML = "";
    document.getElementById("progress").innerHTML = "";
    document.getElementById("review").innerHTML = "";
    document.getElementById("done").innerHTML = "";

    data.tasks.forEach((task) => {
      const card = `
      <div class="task" onclick="openTask(${task.id})">
          <div class="task-header">
              <h4>${task.title}</h4>
              <span class="${task.priority.toLowerCase()}">${task.priority}</span>
          </div>
          <p>${task.description || ""}</p>
          <small>Due : ${task.due_date || "No Date"}</small>
      </div>`;

      switch (task.status) {
        case "Todo": document.getElementById("todo").innerHTML += card; break;
        case "In Progress": document.getElementById("progress").innerHTML += card; break;
        case "Review": document.getElementById("review").innerHTML += card; break;
        case "Done": document.getElementById("done").innerHTML += card; break;
      }
    });
  } catch (error) {
    console.error(error);
  }
}

async function createTask() {
  const title = document.getElementById("taskTitle").value;
  const description = document.getElementById("taskDescription").value;
  const priority = document.getElementById("taskPriority").value;
  const dueDate = document.getElementById("taskDueDate").value;

  const response = await fetch("http://localhost:8000/api/tasks", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ projectId, title, description, priority, dueDate }),
  });
  const data = await response.json();
  
  alert(data.message);
  taskModal.style.display = "none";
  loadTasks();
}

async function openTask(taskId) {
  currentTaskId = taskId;
  const response = await fetch(`http://localhost:8000/api/tasks/${taskId}`, { headers: authHeaders });
  const data = await response.json();
  const task = data.task;

  document.getElementById("editTitle").value = task.title;
  document.getElementById("editDescription").value = task.description || "";
  document.getElementById("editPriority").value = task.priority;
  document.getElementById("editStatus").value = task.status;
  document.getElementById("editDueDate").value = task.due_date || "";
  
  taskDetailsModal.style.display = "flex";
  
  loadAssignMembers(task.assigned_to);
  loadComments();
}

function closeTaskModal() {
  taskDetailsModal.style.display = "none";
}

async function updateTask() {
  try {
    const response = await fetch(`http://localhost:8000/api/tasks/${currentTaskId}`, {
      method: "PUT",
      headers: jsonHeaders,
      body: JSON.stringify({
        title: document.getElementById("editTitle").value,
        description: document.getElementById("editDescription").value,
        priority: document.getElementById("editPriority").value,
        assignedTo: document.getElementById("assignMember").value,
        dueDate: document.getElementById("editDueDate").value || null,
      }),
    });
    const data = await response.json();
    if (!response.ok) return alert(data.message);

    // Kept sequential as per original logic constraints
    await updateStatus();
    await updatePriority();
    await assignTask();

    closeTaskModal();
    loadTasks();
    alert("Task updated successfully.");
  } catch (error) {
    console.error(error);
  }
}

async function assignTask() {
  await fetch(`http://localhost:8000/api/tasks/${currentTaskId}/assign`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify({ assignedTo: document.getElementById("assignMember").value }),
  });
}

async function updateStatus() {
  await fetch(`http://localhost:8000/api/tasks/${currentTaskId}/status`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify({ status: document.getElementById("editStatus").value }),
  });
}

async function updatePriority() {
  await fetch(`http://localhost:8000/api/tasks/${currentTaskId}/priority`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify({ priority: document.getElementById("editPriority").value }),
  });
}

async function deleteTask() {
  if (!confirm("Delete this task?")) return;

  const response = await fetch(`http://localhost:8000/api/tasks/${currentTaskId}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  const data = await response.json();
  
  alert(data.message);
  closeTaskModal();
  loadTasks();
}


// 8. COMMENT FUNCTIONS

async function loadComments() {
  try {
    const response = await fetch(`http://localhost:8000/api/comments/task/${currentTaskId}`, { headers: authHeaders });
    const data = await response.json();
    const container = document.getElementById("commentsContainer");

    container.innerHTML = "";
    if (data.comments.length === 0) {
      container.innerHTML = `<p>No comments yet.</p>`;
      return;
    }

    data.comments.forEach((comment) => {
      container.innerHTML += `
      <div class="comment">
          <div class="comment-header">
              <strong>${comment.username}</strong>
              <small>${new Date(comment.created_at).toLocaleString()}</small>
          </div>
          <p id="comment-${comment.id}">${comment.comment}</p>
          <button class="edit-comment" onclick="editComment(${comment.id})">Edit</button>
          <button class="delete-comment" onclick="deleteComment(${comment.id})">Delete</button>
      </div>`;
    });
  } catch (error) {
    console.error(error);
  }
}

async function addComment() {
  const comment = document.getElementById("newComment").value.trim();
  if (!comment) return alert("Comment cannot be empty.");

  const response = await fetch("http://localhost:8000/api/comments", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ taskId: currentTaskId, comment }),
  });
  const data = await response.json();
  
  alert(data.message);
  document.getElementById("newComment").value = "";
  loadComments();
}

async function editComment(commentId) {
  const oldComment = document.getElementById(`comment-${commentId}`).innerText;
  const newComment = prompt("Edit Comment", oldComment);
  if (!newComment) return;

  const response = await fetch(`http://localhost:8000/api/comments/${commentId}`, {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify({ comment: newComment }),
  });
  const data = await response.json();
  
  alert(data.message);
  loadComments();
}

async function deleteComment(commentId) {
  if (!confirm("Delete this comment?")) return;

  const response = await fetch(`http://localhost:8000/api/comments/${commentId}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  const data = await response.json();
  
  alert(data.message);
  loadComments();
}