void( () => {
    const button = document.querySelector("div.button")
    const url = window.location.href + ":8080/"
    button.addEventListener("click", () => {
        document.location.href = url
    })
})()