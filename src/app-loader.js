const APP_INDEX = [
  "/src/apps/journal/manifest.json",
  "/src/apps/finance-os/manifest.json",
  "/src/apps/forum/manifest.json",
  // add more apps here later
];

const grid = document.getElementById("appGrid");

async function loadApps() {
  grid.innerHTML = "";

  for (const path of APP_INDEX) {
    try {
      const res = await fetch(path);
      const app = await res.json();

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <div class="card-meta">
          <span class="card-label">${app.category || "App"}</span>
        </div>

        <h3>${app.name}</h3>

        <p class="profile-muted">
          ${app.description}
        </p>

        <div class="card-actions">
          <button class="btn-ghost">
            Open
          </button>
        </div>
      `;

      card.querySelector("button").onclick = () => {
        location.href = app.entry;
      };

      grid.appendChild(card);

    } catch (err) {
      console.warn("App failed to load:", path);
    }
  }
}

loadApps();
