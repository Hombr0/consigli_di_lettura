void( () => {
    const button = document.querySelector("div.button")
    const url = "http://localhost:" + window.location.port + "/"
    button.addEventListener("click", () => {
        document.location.href = url
    })
})()