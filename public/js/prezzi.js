void( () => {
    const button = document.querySelector("div.button")
    const url = "http://localhost:8080/"
    button.addEventListener("click", () => {
        document.location.href = url
    })
})()