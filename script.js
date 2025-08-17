const gallery = document.getElementById("gallery");
const API_URL = "https://img-up-del-back.onrender.com/api/images"; // replace with your backend
const searchInput = document.getElementById("searchInput");
const uploadForm = document.getElementById("uploadForm");
const multiUploadForm = document.getElementById("multiUploadForm");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");

let allImages = [];

// Loader elements
const loaderOverlay = document.getElementById("loader-overlay");
const progressBar = document.getElementById("progress");
const loaderText = document.getElementById("loader-text");

function showLoader(message = "Processing...", progress = null) {
    loaderOverlay.style.display = "block";
    loaderText.textContent = message;
    if (progress !== null) {
        progressBar.style.width = progress + "%";
        progressBar.style.display = "block";
    } else {
        progressBar.style.display = "none";
    }
}

function hideLoader() {
    loaderOverlay.style.display = "none";
}

// Single image upload
uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(uploadForm);
    try {
        showLoader("Uploading image...");
        const res = await fetch(API_URL, { method: "POST", body: formData });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        await res.json();
        hideLoader();
        alert("Image uploaded successfully!");
        uploadForm.reset();
        loadGallery();
    } catch (err) {
        hideLoader();
        console.error(err);
        alert("Upload failed: " + err.message);
    }
});

// Multi-image upload
multiUploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const files = multiUploadForm.images.files;
    if (!files || files.length === 0) return alert("No images selected");

    try {
        const res = await fetch(API_URL);
        const existingImages = await res.json();
        let imageCounter = existingImages.length + 1;

        for (let i = 0; i < files.length; i++) {
            showLoader(`Uploading image ${i + 1} of ${files.length}...`, Math.round(((i + 1) / files.length) * 100));
            const formData = new FormData();
            formData.append("image", files[i]);
            formData.append("title", `Image ${imageCounter}`);
            formData.append("tags", `Tag ${imageCounter}`);
            const uploadRes = await fetch(API_URL, { method: "POST", body: formData });
            if (!uploadRes.ok) throw new Error(`Upload failed for Image ${imageCounter}`);
            imageCounter++;
        }

        hideLoader();
        alert(`${files.length} images uploaded successfully!`);
        multiUploadForm.reset();
        loadGallery();

    } catch (err) {
        hideLoader();
        console.error(err);
        alert("Multi upload failed: " + err.message);
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

// Render gallery
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

// Search
searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    const filtered = allImages.filter(img => 
        img.title.toLowerCase().includes(query) ||
        img.tags.some(tag => tag.toLowerCase().includes(query))
    );
    renderGallery(filtered);
});

// Single delete
async function deleteImage(id) {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
        showLoader("Deleting image...");
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        const data = await res.json();
        hideLoader();
        alert(data.message);
        loadGallery();
    } catch (err) {
        hideLoader();
        console.error(err);
        alert("Delete failed: " + err.message);
    }
}

// Multi-delete
async function deleteSelectedImages() {
    const checkboxes = document.querySelectorAll(".select-image:checked");
    if (checkboxes.length === 0) return alert("No images selected");
    if (!confirm(`Delete ${checkboxes.length} selected images?`)) return;

    const ids = Array.from(checkboxes).map(cb => cb.value);
    try {
        for (let i = 0; i < ids.length; i++) {
            showLoader(`Deleting ${i + 1} of ${ids.length}...`, Math.round(((i + 1) / ids.length) * 100));
            await fetch(`${API_URL}/${ids[i]}`, { method: "DELETE" });
        }
        hideLoader();
        alert("Selected images deleted successfully!");
        loadGallery();
    } catch (err) {
        hideLoader();
        console.error(err);
        alert("Bulk delete failed: " + err.message);
    }
}

deleteSelectedBtn.addEventListener("click", deleteSelectedImages);

// Initial load
loadGallery();
