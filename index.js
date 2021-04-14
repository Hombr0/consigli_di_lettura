let div = document.querySelectorAll("div.column")
let button = document.querySelectorAll("div.button")

for(let i = 0; i < div.length; i++){
    div[i].addEventListener("mouseenter", () => {
        button[i].style.visibility = "visible"
    })
    div[i].addEventListener("mouseleave", () => {
        button[i].style.visibility = "hidden"
    })
    button[i].addEventListener("mouseenter", () => {
        button[i].style.visibility = "visible"
    })
}

let img = document.querySelectorAll("img.column")
for(let i = 0; i < img.length; i++){
    img[i].addEventListener("click", () => {
        img[i].insertAdjacentHTML('beforebegin', `<div class="modal">
        <span class="exit">&times;</span>
        <img class="modal-content">
    </div>`)
        let modalImage = document.querySelectorAll("img.modal-content")[0]
        let image = img[i].getAttribute("src")
        modalImage.setAttribute("src", image)
        let span = document.querySelectorAll("span")[0]
        span.addEventListener("click", () => {
            let zoomImg = document.querySelectorAll(".modal")[0]
            zoomImg.remove()
        })
    })
}