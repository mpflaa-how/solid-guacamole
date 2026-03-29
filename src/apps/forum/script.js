import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
    "https://adkljqadhghboezfazxz.supabase.co",
    "sb_publishable_cEo9AM4ZL0T21rG-Fn1RlA_u2nW5vj6"
);

let session = null;
let currentCategory = null;
let currentThread = null;

// DOM
const categoryList = document.getElementById("categoryList");
const threadList = document.getElementById("threadList");
const postList = document.getElementById("postList");

// INIT
init();

async function init() {
    const { data } = await supabase.auth.getSession();
    session = data.session;

    if (!session) {
        location.href = "/login.html";
        return;
    }

    loadCategories();
}

/* ============================
   CATEGORIES
============================ */

async function loadCategories() {
    const { data } = await supabase.from("categories").select("*");

    categoryList.innerHTML = "";
    data.forEach(cat => {
        const div = document.createElement("div");
        div.className = "forum-category";
        div.textContent = cat.name;
        div.onclick = () => selectCategory(cat.id);
        categoryList.appendChild(div);
    });
}

async function selectCategory(id) {
    currentCategory = id;
    currentThread = null;
    postList.innerHTML = "Select a thread to view posts.";
    loadThreads();
}

/* ============================
   THREADS
============================ */

async function loadThreads() {
    const { data } = await supabase
        .from("threads")
        .select("*")
        .eq("category", currentCategory)
        .order("created_at", { ascending: false });

    threadList.innerHTML = "";

    if (!data.length) {
        threadList.innerHTML = "No threads yet.";
        return;
    }

    data.forEach(t => {
        const div = document.createElement("div");
        div.className = "forum-thread";
        div.innerHTML = `<strong>${t.title}</strong><br>${t.preview}`;
        div.onclick = () => selectThread(t.id);
        threadList.appendChild(div);
    });
}

async function selectThread(id) {
    currentThread = id;
    loadPosts();
}

/* ============================
   POSTS
============================ */

async function loadPosts() {
    const { data } = await supabase
        .from("posts")
        .select("*, author(email)")
        .eq("thread", currentThread)
        .order("created_at", { ascending: true });

    postList.innerHTML = "";

    if (!data.length) {
        postList.innerHTML = "No posts yet.";
        return;
    }

    data.forEach(p => {
        const div = document.createElement("div");
        div.className = "forum-post";
        div.innerHTML = `
      <strong>${p.author?.email || "Unknown"}</strong><br>
      ${p.body}
    `;
        postList.appendChild(div);
    });
}

/* ============================
   CREATE THREAD
============================ */

document.getElementById("threadCreate").onclick = async () => {
    const title = threadTitle.value.trim();
    const body = threadBody.value.trim();

    if (!title || !body || !currentCategory) return;

    const preview = body.slice(0, 80) + "...";

    const { data: thread } = await supabase
        .from("threads")
        .insert({
            category: currentCategory,
            title,
            preview,
            author: session.user.id
        })
        .select()
        .single();

    await supabase.from("posts").insert({
        thread: thread.id,
        author: session.user.id,
        body
    });

    threadModal.hidden = true;
    threadTitle.value = "";
    threadBody.value = "";

    loadThreads();
    selectThread(thread.id);
};

/* ============================
   REPLY TO THREAD
============================ */

document.getElementById("postSend").onclick = async () => {
    if (!currentThread) return;

    const body = postInput.value.trim();
    if (!body) return;

    await supabase.from("posts").insert({
        thread: currentThread,
        author: session.user.id,
        body
    });

    postInput.value = "";
    loadPosts();
};
