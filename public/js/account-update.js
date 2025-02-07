const infoForm = document.querySelector("#update-info-form");
const pwForm = document.querySelector("#update-pw-form");
infoForm.addEventListener("change", () => {
    const updateBtn = document.querySelector("#update-info-btn");
    updateBtn.removeAttribute("disabled");
})
pwForm.addEventListener("change", () => {
    const pwBtn = document.querySelector("#update-pw-btn");
    pwBtn.removeAttribute("disabled");
})