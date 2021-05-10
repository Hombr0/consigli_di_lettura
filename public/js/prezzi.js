void( () => {
    const button = document.querySelector("div.button")
    const url = window.location.href
    button.addEventListener("click", () => {
        document.location.href = url
    })
})()