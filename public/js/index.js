void( () => 
{
    const div = document.querySelectorAll("div.column")
    const button = document.querySelectorAll("div.button")
    const postRequest = (e) => {
        const loading = document.querySelector("div.loading")
        loading.style.display = "block"
        
        const url = "https://consigli-di-lettura.herokuapp.com/"
         data = { "data" : e.currentTarget.nextElementSibling.innerHTML}
        console.log(e.currentTarget.nextElementSibling.innerHTML)
        fetch(url + "titolo", {
            method : "POST",
            headers: {
                'Content-type' : 'application/json',
            },
            body: JSON.stringify(data)
        })
            .then( res => {
                document.location.href = url + "prezzi"
            })
            .catch( err => {
                throw err
                div[0].insertAdjacentHTML('beforebegin', 
                `<div id="divError">
                    Impossibile raggiungere il server, riprovare più tardi
                    <span id="spanError">&times;</span>
                    <!-- <h4 id="textError">Impossibile raggiungere il server, riprovare più tardi</h4> -->
                </div>`)
                const span = document.querySelectorAll("#spanError")[0]
                span.addEventListener("click", () => {
                    const zoomImg = document.querySelectorAll("#divError")[0]
                    zoomImg.remove()
                })
            })
            
    }

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
        button[i].addEventListener("click", postRequest)
    }

    const img = document.querySelectorAll("img.column")
    for(let i = 0; i < img.length; i++){
        img[i].addEventListener("click", () => {
            img[i].insertAdjacentHTML('beforebegin', 
            `<div class="modal">
                <span class="exit">&times;</span>
                <img class="modal-content">
            </div>`)
            const modalImage = document.querySelectorAll("img.modal-content")[0]
            const image = img[i].getAttribute("src")
            modalImage.setAttribute("src", image)
            const span = document.querySelectorAll("span")[0]
            span.addEventListener("click", () => {
                const zoomImg = document.querySelectorAll(".modal")[0]
                zoomImg.remove()
            })
        })
    }
})()