
    const postsContainer = document.getElementById('postsContainer');
    const postForm = document.getElementById('postForm');
    const postFormContainer = document.getElementById('postFormContainer');
    const toggleFormBtn = document.getElementById('toggleFormBtn');
    const titleInput = document.getElementById('title');
    const descInput = document.getElementById('description');
    const imgInput = document.getElementById('image');

    const defaultProfile = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    let posts = JSON.parse(localStorage.getItem('socialPosts')) || [];

    // Dummy posts without comments
    if (!posts || posts.length === 0) {
      posts = [
        {
          id: Date.now() + 1,
          title: "Study Motivation 💪",
          description: "Remember, progress is progress, no matter how small!",
          likes: 3,
          comments: [],
          author: "Anna",
          profile: defaultProfile
        },
        {
          id: Date.now() + 2,
          title: "My Pomodoro Setup 🍅",
          description: "Here's my study setup for today's 25-minute focus session!",
          likes: 5,
          comments: [],
          author: "Marco",
          profile: defaultProfile
        }
      ];
      localStorage.setItem('socialPosts', JSON.stringify(posts));
    }

    // Ensure all posts have comments array
    posts.forEach(p => {
      if (!Array.isArray(p.comments)) p.comments = [];
    });

    // Toggle form visibility
    toggleFormBtn.addEventListener('click', () => {
      postFormContainer.style.display =
        postFormContainer.style.display === 'none' ? 'block' : 'none';
      toggleFormBtn.innerHTML = postFormContainer.style.display === 'none'
        ? `<i class="bi bi-plus-circle"></i> Post`
        : `<i class="bi bi-dash-circle"></i> Cancel`;
    });

    // Render posts
    function renderPosts() {
      postsContainer.innerHTML = '';
      posts.slice().reverse().forEach((post, index) => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post-card';

        postDiv.innerHTML = `
          <div class="post-header">
            <img src="${post.profile || defaultProfile}" alt="profile" class="post-profile">
            <div>
              <h6 class="m-0">${post.author || "You"}</h6>
              <small class="text-muted">${post.title}</small>
            </div>
          </div>
          <p>${post.description}</p>
          ${post.image ? `<img src="${post.image}" class="post-image" alt="post image">` : ""}
          <div class="d-flex align-items-center mt-2 gap-3">
            <button class="btn btn-sm btn-outline-danger like-btn">
              <i class="bi bi-heart${post.liked ? '-fill' : ''}"></i> <span>${post.likes}</span>
            </button>
            <button class="btn btn-sm btn-outline-secondary comment-toggle">
              <i class="bi bi-chat"></i> ${post.comments.length}
            </button>
            ${!post.author || post.author === "You" ? `<button class="btn btn-sm btn-outline-dark delete-btn"><i class="bi bi-trash"></i></button>` : ""}
          </div>
          <div class="comments mt-3" style="display:none;">
            <div class="comment-list">
              ${post.comments.map(c => `
                <div class="comment-box">
                  <img src="${defaultProfile}" class="commenter-pic">
                  <div>
                    <strong>${c.name || "Anonymous"}</strong><br>${c.text || ""}
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="d-flex mt-2">
              <input type="text" class="form-control form-control-sm me-2 comment-input" placeholder="Add a comment">
              <button class="btn btn-sm btn-red comment-submit">Post</button>
            </div>
          </div>
        `;

        // Like button
        postDiv.querySelector('.like-btn').onclick = () => {
          post.liked = !post.liked;
          post.likes += post.liked ? 1 : -1;
          savePosts();
          renderPosts();
        };

        // Delete post
        const deleteBtn = postDiv.querySelector('.delete-btn');
        if (deleteBtn) {
          deleteBtn.onclick = () => {
            posts.splice(posts.length - 1 - index, 1);
            savePosts();
            renderPosts();
          };
        }

        // Toggle comments
        postDiv.querySelector('.comment-toggle').onclick = () => {
          const commentsDiv = postDiv.querySelector('.comments');
          commentsDiv.style.display = commentsDiv.style.display === 'none' ? 'block' : 'none';
        };

        // Add comment
        postDiv.querySelector('.comment-submit').onclick = () => {
          const commentInput = postDiv.querySelector('.comment-input');
          const text = commentInput.value.trim();
          if (text) {
            post.comments.push({ name: "You", text });
            savePosts();
            renderPosts();
          }
        };

        postsContainer.appendChild(postDiv);
      });
    }

    function savePosts() {
      localStorage.setItem('socialPosts', JSON.stringify(posts));
    }

    // Add new post
    postForm.addEventListener('submit', e => {
      e.preventDefault();

      const reader = new FileReader();
      const newPost = {
        id: Date.now(),
        title: titleInput.value.trim(),
        description: descInput.value.trim(),
        image: "",
        likes: 0,
        comments: [],
        author: "You",
        profile: defaultProfile
      };

      if (imgInput.files[0]) {
        reader.onload = () => {
          newPost.image = reader.result;
          posts.push(newPost);
          savePosts();
          renderPosts();
          resetForm();
        };
        reader.readAsDataURL(imgInput.files[0]);
      } else {
        posts.push(newPost);
        savePosts();
        renderPosts();
        resetForm();
      }
    });

    function resetForm() {
      postForm.reset();
      postFormContainer.style.display = 'none';
      toggleFormBtn.innerHTML = `<i class="bi bi-plus-circle"></i> Post`;
    }

    renderPosts();
 
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
