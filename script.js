const gallery = document.getElementById("gallery");
const API_URL = "https://img-up-del-back.onrender.com/api/images"; // replace with your deployed backend
const searchInput = document.getElementById("searchInput");
const uploadForm = document.getElementById("uploadForm");

let allImages = [];

// Upload image
uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(uploadForm);

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: formData
        });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        alert("Image uploaded successfully!");
        uploadForm.reset();
        loadGallery();
    } catch (err) {
        console.error(err);
        alert("Upload failed: " + err.message);
    }
});

// Load gallery
async function loadGallery() {
    try {
        const res = await fetch(API_URL);
        allImages = await res.json();
        renderGallery(allImages);
    } catch (err) {
        console.error(err);
    }
}

function renderGallery(images) {
    gallery.innerHTML = images.map(img => `
        <div class="image-card">
            <input type="checkbox" class="select-image" value="${img._id}">
            <img src="${img.url}" title="${img.title}">
            <p>${img.title}</p>
            <p>Tags: ${img.tags.join(", ")}</p>
            <button onclick="deleteImage('${img._id}')">Delete</button>
        </div>
    `).join("");
}

// Search images
searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    const filtered = allImages.filter(img => 
        img.title.toLowerCase().includes(query) ||
        img.tags.some(tag => tag.toLowerCase().includes(query))
    );
    renderGallery(filtered);
});

// Delete single image
async function deleteImage(id) {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        const data = await res.json();
        alert(data.message);
        loadGallery();
    } catch (err) {
        console.error(err);
        alert("Delete failed: " + err.message);
    }
}

// Delete multiple images
async function deleteSelectedImages() {
    const checkboxes = document.querySelectorAll(".select-image:checked");
    if (checkboxes.length === 0) return alert("No images selected");

    if (!confirm(`Delete ${checkboxes.length} selected images?`)) return;

    const ids = Array.from(checkboxes).map(cb => cb.value);

    try {
        const res = await fetch(API_URL, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids })
        });
        const data = await res.json();
        alert(data.message);
        loadGallery();
    } catch (err) {
        console.error(err);
        alert("Bulk delete failed: " + err.message);
    }
}

document.getElementById("deleteSelectedBtn").addEventListener("click", deleteSelectedImages);

// Initial gallery load
loadGallery();

