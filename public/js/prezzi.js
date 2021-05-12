void( () => {
    const button = document.querySelector("div.button")
    const url = "https://consigli-di-lettura.herokuapp.com/"
    // const url = "http://localhost:4080/"
    button.addEventListener("click", () => {
        document.location.href = url
    })
})()