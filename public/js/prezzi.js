void( () => {
    const button = document.querySelector("div.button")
    const url = "https://consigli-di-lettura.herokuapp.com/"
    button.addEventListener("click", () => {
        document.location.href = url
    })
})()