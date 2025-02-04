const form = document.querySelector("#updateForm");
form.addEventListener("change", () => {
    const updateBtn = document.querySelector(".submit-btn");
    updateBtn.removeAttribute("disabled");
})