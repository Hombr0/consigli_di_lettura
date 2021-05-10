void( () => {
    const button = document.querySelector("div.button")
    const url = window.location.href + window.location.port
    button.addEventListener("click", () => {
        document.location.href = url
    })
})()